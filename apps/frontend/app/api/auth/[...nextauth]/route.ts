import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { BACKEND_URL } from '@/app/config';
import { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET =process.env.GOOGLE_CLIENT_SECRET || "";
const NEXTAUTH_SECRET =process.env.NEXTAUTH_SECRET || "";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'Your Email' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/user/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.email,
            password: credentials.password,
          }),
        });

        const userData = await response.json();

        if (response.ok && userData.token) {
          return { ...userData }; // Return user data
        }
        throw new Error(userData.error || 'Failed to login');
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email && profile?.name) {
        const response = await fetch(`${BACKEND_URL}/api/v1/user/google-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: profile.email,
            name: profile.name,
          }),
        });

        const userData = await response.json();

        if (response.ok) {
          user.token = userData.token; // Ensure this is a valid token
        } else {
          console.error("Google login error:", userData);
          throw new Error(userData.error || 'Google login failed');
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.token) {
        token.accessToken = user.token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
};

// Handle GET and POST requests for NextAuth
export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, authOptions);
};

export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, authOptions);
};
