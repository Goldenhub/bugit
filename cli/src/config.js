import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Change this before publishing to npm
export const API_URL = process.env.BUGIT_API_URL ?? 'http://localhost:3001';

const CONFIG_PATH = join(homedir(), '.buglogrc');

function readConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getToken() {
  return readConfig().token ?? null;
}

export function saveToken(token) {
  const config = readConfig();
  config.token = token;
  writeConfig(config);
}

export function clearToken() {
  const config = readConfig();
  delete config.token;
  writeConfig(config);
}
