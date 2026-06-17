import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import type { Session } from 'next-auth';

export async function requireSession(): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthenticated');
  return session;
}

export { getServerSession, authOptions };
