import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: FirestoreAdapter(getAdminFirestore()),
    session: { strategy: "jwt" },
    pages: {
        signIn: '/login',
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
