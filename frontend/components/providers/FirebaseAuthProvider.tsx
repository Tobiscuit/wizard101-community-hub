'use native';
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        if (session?.user?.firebaseToken) {
            // Sign in to Firebase with the custom token generated server-side
            signInWithCustomToken(auth, session.user.firebaseToken)
                .catch((error) => console.error("Firebase Auth Sync Failed:", error));
        } else {
            // If no session, ensure Firebase is signed out
             if (auth.currentUser) {
                signOut(auth);
            }
        }
    }, [session, status]);

    return <>{children}</>;
}
