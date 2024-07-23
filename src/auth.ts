import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db";
import { env } from "./env.js";

export const authConfig = {
    providers: [GitHub],
    adapter: DrizzleAdapter(db),
    secret: env.AUTH_SECRET,
    callbacks: {
        async session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
    },
    //debug: true,
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
