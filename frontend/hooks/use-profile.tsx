"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
    getUserProfile, 
    ensureUserProfile, 
    getUserWizards, 
    getUserPets 
} from '@/services/profile-service';
import { UserProfile, Wizard, Pet } from '@/types/firestore';

export function useProfile() {
    const { data: session, status } = useSession();
    
    // State
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [wizards, setWizards] = useState<Wizard[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Logic
    const fetchProfileData = useCallback(async () => {
        if (status !== 'authenticated' || !session?.user?.id) return;
        
        try {
            setLoading(true);
            const uid = session.user.id;
            
            // 1. Ensure Profile Exists (Create default if new)
            // We pass session email, but strictly CONTROL the Display Name
            // If Discord Username exists, use it. Otherwise pass undefined to auto-generate random Wizard Name.
            // WE NEVER PASS session.user.name to avoid Real Name leaks (Google).
            const cleanDisplayName = session.user.discordUsername || undefined;

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
    }, [session, status]);

    // Trigger Fetch on Session Change
    useEffect(() => {
        if (status === 'loading') return;
        
        if (status === 'unauthenticated') {
            setLoading(false);
            setProfile(null);
            return;
        }

        fetchProfileData();
    }, [status, fetchProfileData]);

    return { 
        profile, 
        wizards, 
        pets, 
        loading: loading || status === 'loading', 
        error,
        refresh: fetchProfileData 
    };
}
