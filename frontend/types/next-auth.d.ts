import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            discordId?: string;
        } & DefaultSession["user"];
    }

    interface User {
        discordId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        discordId?: string;
    }
}
