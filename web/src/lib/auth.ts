import type { AuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { createHash, randomBytes } from 'crypto';
import { BrevoClient } from '@getbrevo/brevo';
import clientPromise from './mongodb';

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

async function createWebApiToken(userId: string): Promise<string> {
  const raw = randomBytes(32).toString('hex');
  const client = await clientPromise;
  const db = client.db();
  await db.collection('api_tokens').deleteMany({ userId, name: 'web' });
  await db.collection('api_tokens').insertOne({
    userId,
    tokenHash: sha256(raw),
    name: 'web',
    createdAt: new Date(),
  });
  return raw;
}

async function sendMagicLink(to: string, url: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`\n[BugIt] Magic link for ${to}:\n${url}\n`);
    return;
  }

  const client = new BrevoClient({ apiKey });

  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@bugit.dev',
      name: process.env.EMAIL_FROM_NAME ?? 'BugIt',
    },
    to: [{ email: to }],
    subject: 'Sign in to BugIt',
    htmlContent: `
      <div style="font-family:monospace;max-width:480px;margin:40px auto;padding:32px;background:#18181b;color:#f4f4f5;border-radius:12px">
        <h2 style="margin:0 0 16px;font-size:20px">Sign in to <span style="color:#818cf8">BugIt</span></h2>
        <p style="color:#a1a1aa;margin:0 0 24px">Click the button below. This link expires in 24 hours and can only be used once.</p>
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">Sign in to BugIt</a>
        <p style="color:#52525b;font-size:12px;margin:24px 0 0">Or copy: <span style="color:#71717a">${url}</span></p>
      </div>
    `,
    textContent: `Sign in to BugIt\n\n${url}\n\nThis link expires in 24 hours.`,
  });
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@bugit.dev',
      sendVerificationRequest: ({ identifier, url }) =>
        sendMagicLink(identifier, url),
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.apiToken = await createWebApiToken(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      session.userId = token.userId;
      session.apiToken = token.apiToken;
      return session;
    },
  },
};
