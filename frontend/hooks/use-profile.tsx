"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { 
    getUserProfile, 
    ensureUserProfile, 
    getUserWizards, 
    getUserPets 
} from '@/services/profile-service';
import { UserProfile, Wizard, Pet } from '@/types/firestore';

export function useProfile() {
    const { data: session, isPending } = useSession();
    
    // State
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [wizards, setWizards] = useState<Wizard[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Logic
    const fetchProfileData = useCallback(async () => {
        if (isPending || !session?.user?.id) return;
        
        try {
            setLoading(true);
            const uid = session.user.id;

            // RACE CONDITION FIX: Wait for Firebase Auth to sync with Better Auth
            // We poll for up to 3 seconds for auth.currentUser to match
            let retries = 0;
            while (retries < 30) {
                // @ts-ignore
                const fbUser = (await import('@/lib/firebase')).auth.currentUser;
                if (fbUser && fbUser.uid === uid) break;
                await new Promise(r => setTimeout(r, 100)); // wait 100ms
                retries++;
            }

            // 1. Ensure Profile Exists (Create default if new)
            // ... (rest of logic)
            const cleanDisplayName = undefined; 

            const userProfile = await ensureUserProfile(
                uid, 
                session.user.email || '', 
                cleanDisplayName
            );
            
            setProfile(userProfile);

            // 2. Parallel Fetch Subcollections
            const [fetchedWizards, fetchedPets] = await Promise.all([
                getUserWizards(uid),
                getUserPets(uid)
            ]);

            setWizards(fetchedWizards);
            setPets(fetchedPets);
            
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError("Failed to load your wizard profile.");
        } finally {
            setLoading(false);
        }
    }, [session, isPending]);

    // Trigger Fetch on Session Change
    useEffect(() => {
        if (isPending) return;
        
        if (!session) {
            setLoading(false);
            setProfile(null);
            return;
        }

        fetchProfileData();
    }, [isPending, session, fetchProfileData]);

    return { 
        profile, 
        wizards, 
        pets, 
        loading: loading || status === 'loading', 
        error,
        refresh: fetchProfileData 
    };
}
