// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const NEXT_AUTH: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // Called during sign-in
    async signIn({ user, account, profile }) {
      return true; // Proceed with sign-in
    },

    // Called after successful sign-in, used to modify JWT
    async jwt({ token, account, user }) {
      if (account && user) {
        // Custom token property to identify Google users
        token.authProvider = 'google';
        token.email = user.email;
      }
      return token;
    },

    // Called on each request to set up session
  
    async session({ session, token }) {
      // Attach token properties to session for client-side use
          //@ts-ignore
      session.user.email = token.email;
        //@ts-ignore
      session.user.authProvider = token.authProvider;
      return session;
    },
  },
};
