import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { authConfig } from "./auth.config";

import { getAdminAuth } from "@/lib/firebase-admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: FirestoreAdapter(getAdminFirestore()),
    session: { strategy: "jwt" },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            // 1. Run default/config session logic first
            if (authConfig.callbacks?.session) {
                session = await authConfig.callbacks.session({ session, token, user: null as any, newSession: null });
            }

            // 2. Generate Firebase Custom Token (Node.js runtime only)
            if (session.user?.id) {
                try {
                    const firebaseToken = await getAdminAuth().createCustomToken(session.user.id);
                    session.user.firebaseToken = firebaseToken;
                } catch (error) {
                    console.error("Error creating custom token:", error);
                }
            }
            return session;
        }
    },
    events: {
        async signIn({ user, account, profile }) {
            // When user signs in with Discord, store their Discord ID
            if (account?.provider === 'discord' && account?.providerAccountId && user?.id) {
                const db = getAdminFirestore();
                await db.collection("users").doc(user.id).set({
                    discordId: account.providerAccountId,
                    updatedAt: new Date()
                }, { merge: true });
            }
        }
    }
});
