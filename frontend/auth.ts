import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    adapter: FirestoreAdapter(getAdminFirestore()),
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                // Add user ID to session
                session.user.id = user.id;

                // Add Discord ID if available (from account linking)
                // Note: This requires looking up the Account in Firestore, which the adapter handles.
                // We might need to extend the session type to include this.
            }
            return session;
        },
    },
});
