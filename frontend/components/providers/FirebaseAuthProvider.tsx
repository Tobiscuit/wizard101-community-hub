'use native';
'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client'; // BetterAuth Client
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (isPending) return;

        if (session?.user) {
            // 1. Fetch Custom Token from our API (which validates BetterAuth session)
            fetch('/api/auth/firebase-token')
                .then(res => res.json())
                .then(data => {
                    if (data.token) {
                        return signInWithCustomToken(auth, data.token);
                    }
                })
                .catch(err => console.error("Firebase Auth Sync Failed:", err));
        } else {
            // 2. If no session, ensure Firebase is signed out
            if (auth.currentUser) {
                signOut(auth);
            }
        }
    }, [session, isPending]);

    return <>{children}</>;
}
