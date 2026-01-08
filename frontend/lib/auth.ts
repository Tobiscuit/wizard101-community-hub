import { betterAuth } from "better-auth";
import { firestoreAdapter } from "better-auth-firestore";
import { getAdminFirestore } from "./firebase-admin";

export const auth = betterAuth({
    database: firestoreAdapter(getAdminFirestore()),
    socialProviders: {
        google: { 
            clientId: process.env.AUTH_GOOGLE_ID as string, 
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string, 
        },
        discord: { 
            clientId: process.env.AUTH_DISCORD_ID as string, 
            clientSecret: process.env.AUTH_DISCORD_SECRET as string, 
        }, 
    },
    // Trust Host for Coolify Proxy
    trustedOrigins: [process.env.NEXTAUTH_URL || "http://localhost:3000"],
});
