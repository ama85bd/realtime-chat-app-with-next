import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import { NextAuthOptions } from 'next-auth';
import { db } from './lib/db';
import GoogleProvider from 'next-auth/providers/google';

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_ID');
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_SECRET');
  }

  return {
    clientId,
    clientSecret,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbUser = (await db.get(`user:${token?.id}`)) as User | null;

      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
    redirect() {
      return '/dashboard';
    },
  },
};

// import NextAuth from 'next-auth';
// import github from 'next-auth/providers/github';
// import { db } from './lib/db';

// const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
// const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
//   throw new Error('Missing github ouath credentials');
// }

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth({
//   adapter: PrismaAdapter(db),
//   providers: [
//     github({
//       clientId: GITHUB_CLIENT_ID,
//       clientSecret: GITHUB_CLIENT_SECRET,
//     }),
//   ],
//   callbacks: {
//     // Usually not needed, we are fixing a bug in next auth
//     async session({ session, user }: any) {
//       if (session && user) {
//         session.user.id = user.id;
//       }
//       return session;
//     },
//   },
// });
