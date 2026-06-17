import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    userId: string;
    apiToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    apiToken: string;
  }
}
