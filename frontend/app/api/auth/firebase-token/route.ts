import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth"; // BetterAuth Server Instance
import { getAdminAuth } from "@/lib/firebase-admin";
import { headers } from "next/headers";

export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const token = await getAdminAuth().createCustomToken(session.user.id);
        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error minting token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
