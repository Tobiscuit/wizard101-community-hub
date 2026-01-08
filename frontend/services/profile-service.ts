import { db } from '@/lib/firebase';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    getDocs, 
    query, 
    where, 
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { UserProfile, Wizard, Pet } from '@/types/firestore';

// --- User Profile ---

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;
    
    // 1. Fetch Root User Doc
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        // Convert Firestore Timestamps to JS Date if needed, or pass as is
        // Our types use Timestamp, so we pass as is.
        return { uid: userSnap.id, ...data } as UserProfile;
    }
    
    return null;
}

export async function ensureUserProfile(uid: string, email: string, displayName?: string): Promise<UserProfile> {
    const existing = await getUserProfile(uid);
    if (existing) return existing;

    // Privacy-First Identity:
    // If no displayName is provided (Google Login), generate a random anonymous handle.
    // If displayName IS provided (Discord Login), use it.
    let finalDisplayName = displayName;
    
    if (!finalDisplayName) {
        const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
        finalDisplayName = `MysteriousWizard-${randomSuffix}`;
    }

    // Create Default Profile
    const newProfile: UserProfile = {
        uid,
        email,
        displayName: finalDisplayName,
        hatchReputation: 0,
        marketReputation: 0,
        vouchCount: 0,
        analytics: {
            totalHatches: 0,
            empowersEarned: 0,
            empowersSpent: 0,
            packsGifted: 0,
            mostHatchedSchool: 'None',
            favoritePetBody: 'None',
            goldSavedEstimate: 0,
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        theme: 'candlelight',
        accountStatus: 'active'
    };

    await setDoc(doc(db, "users", uid), newProfile);
    return newProfile;
}

// --- Wizards Subcollection ---

export async function getUserWizards(uid: string): Promise<Wizard[]> {
    if (!uid) return [];
    
    const wizRef = collection(db, "users", uid, "wizards");
    const snapshot = await getDocs(wizRef);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Wizard));
}

// --- Pets Subcollection ---

export async function getUserPets(uid: string): Promise<Pet[]> {
    if (!uid) return [];
    
    const petRef = collection(db, "users", uid, "pets");
    const snapshot = await getDocs(petRef);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Pet));
}

export async function updateUserPet(uid: string, petId: string, updates: Partial<Pet>): Promise<void> {
    if (!uid || !petId) return;

    const petDocRef = doc(db, "users", uid, "pets", petId);
    
    await updateDoc(petDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
}
