import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

export const authConfig = {
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }
            // Capture Discord provider ID
            if (account?.provider === 'discord' && account?.providerAccountId) {
                token.discordId = account.providerAccountId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token?.id) {
                session.user.id = token.id as string;
            }
            // Pass Discord ID to session
            if (token?.discordId) {
                session.user.discordId = token.discordId as string;
            }
            return session;
        },
        authorized({ auth, request: nextUrl }) {
            const isLoggedIn = !!auth?.user;
            const isOnMyPets = nextUrl.nextUrl.pathname.startsWith('/my-pets');

            if (isOnMyPets) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
