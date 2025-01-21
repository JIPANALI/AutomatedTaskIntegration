// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }

  interface User extends DefaultUser {
    token?: string; // Add the token property to User type
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string; // Add the accessToken to JWT type
  }
}
