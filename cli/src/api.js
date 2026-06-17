import { getToken, API_URL } from './config.js';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
    });
    clearTimeout(timer);

    if (res.status === 401) {
      throw new ApiError('Not authenticated - run: bug login', 401);
    }
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const body = await res.json(); msg = body.message ?? msg; } catch {}
      throw new ApiError(msg, res.status);
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new ApiError('API unreachable - is the BugIt server running?', 0);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Network error: ${err.message}`, 0);
  }
}
