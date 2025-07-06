import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import axios from "axios";

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username/Email", type: "text", placeholder: "" },
        password: { label: "Password", type: "" },
      },
      async authorize(credentials) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/local`,
            {
              identifier: credentials.username,
              password: credentials.password,
            }
          );
          return data || null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      const { provider, access_token: accessToken } = account || {};
      if (user && ["google", "facebook"].includes(provider)) {
        try {
          const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/${provider}/callback?access_token=${accessToken}`
          );
          token.jwt = data.jwt;
          token.id = data.user.id;
        } catch (error) {
          console.log(
            `Error:${process.env.NEXT_PUBLIC_STRAPI}/auth/${provider}`,
            error?.response?.data || error.message
          );
        }
      }
      if (user && provider === "credentials") {
        // signing in
        token.jwt = user.jwt;
        token.id = user.user.id;
      }
      return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
      session.jwt = token.jwt;
      session.user.id = token.id;
      return Promise.resolve(session);
    },
  },
};

export default NextAuth(authOptions);
