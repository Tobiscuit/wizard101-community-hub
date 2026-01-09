'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { calculateAllPotentials, applyJewelBonus } from "@/lib/talent-formulas";

// Helper function for server-side session
async function getSession() {
    return await auth.api.getSession({ headers: await headers() });
}

export async function savePet(petData: any) {
    const session = await getSession();

    if (!session?.user?.id) {
        throw new Error("Unauthorized: You must be logged in to save a pet.");
    }

    try {
        const db = getAdminFirestore();
        const petRef = db.collection("user_pets").doc(); // Auto-ID

        await petRef.set({
            userId: session.user.id,
            petNickname: petData.petNickname || "",
            petType: petData.petType || "Unknown Pet",
            petSchool: petData.petSchool || "Unknown",
            petAge: petData.petAge || "Baby",
            currentStats: petData.currentStats,
            maxPossibleStats: petData.maxPossibleStats,
            talents: petData.talents || [],
            advice: petData.advice || "",
            isMaxed: false,
            listedInMarketplace: false,
            createdAt: new Date(), // Firestore Admin prefers Date objects or Timestamp
            updatedAt: new Date()
        });

        revalidatePath('/my-pets');
        return { success: true, id: petRef.id };
    } catch (error: any) {
        console.error("Server Action savePet Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getPets() {
    const session = await getSession();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const db = getAdminFirestore();
        const petsRef = db.collection("user_pets");
        const snapshot = await petsRef.where("userId", "==", session.user.id).get();

        const pets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Timestamps to dates/strings for serialization
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));

        return {
            success: true,
            pets,
            debug: {
                userId: session.user.id,
                count: pets.length
            }
        };
    } catch (error: any) {
        console.error("Server Action getPets Error:", error);
        return { success: false, error: error.message };
    }
}

export async function listPetInMarketplace(petId: string, listingData: any, discordUsername?: string) {
    const session = await getSession();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const db = getAdminFirestore();
        const userDoc = await db.collection("users").doc(session.user.id).get();
        const userData = userDoc.data();

        // Priority 1: Discord ID from OAuth (best UX)
        const discordId = userData?.discordId || null;
        const finalDiscordUsername = discordUsername || userData?.discordUsername || null;

        // If user provided a username this time, save it for future use
        if (discordUsername) {
            await db.collection("users").doc(session.user.id).set({
                discordUsername: discordUsername,
                updatedAt: new Date()
            }, { merge: true });
        }

        // Require at least Discord ID OR username
        if (!discordId && !finalDiscordUsername) {
            throw new Error("A Discord contact method is required to list pets in the Kiosk.");
        }

        // 1. Apply Jewel Bonus if present
        const statsToCalculate = applyJewelBonus(listingData.currentStats, listingData.socketedJewel);

        // 2. Calculate stats
        const potentials = calculateAllPotentials(statsToCalculate);

        // 3. Create listing
        await db.collection("market_listings").add({
            petId: petId,
            userId: session.user.id,
            ownerDisplayName: session.user.name || "Unknown Wizard",
            ownerContact: {
                discordId: discordId, // Discord User ID from OAuth (enables direct DM link)
                discordUsername: finalDiscordUsername, // Fallback username for display/manual contact
            },
            ...listingData,
            calculatedDamage: `${potentials.damage.dealer}%`,
            calculatedResist: `${potentials.resist.proof}%`,
            price: listingData.price || {
                type: "Empowers",
                amount: 50
            },
            status: 'active', // REQUIRED for client-side query
            createdAt: new Date(),
            listedAt: new Date()
        });

        // 2. Update pet status
        await db.collection("user_pets").doc(petId).update({
            listedInMarketplace: true
        });

        revalidatePath('/my-pets');
        return { success: true };
    } catch (error: any) {
        console.error("Server Action listPetInMarketplace Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getMarketplaceListings() {
    try {
        const db = getAdminFirestore();
        const listingsRef = db.collection("market_listings");
        const snapshot = await listingsRef.orderBy("listedAt", "desc").limit(50).get();

        // Get all unique user IDs to fetch presence
        const userIds = new Set(snapshot.docs.map(doc => doc.data().userId));
        const userDocsPromises = Array.from(userIds).map(uid => db.collection("users").doc(uid).get());
        const userDocs = await Promise.all(userDocsPromises);

        const userPresenceMap: Record<string, Date | null> = {};
        userDocs.forEach(doc => {
            if (doc.exists) {
                const data = doc.data();
                userPresenceMap[doc.id] = data?.lastSeen?.toDate() || null;
            }
        });

        const listings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                listedAt: data.listedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                ownerLastSeen: userPresenceMap[data.userId] ? userPresenceMap[data.userId]?.toISOString() : null
            };
        });

        return { success: true, listings };
    } catch (error: any) {
        console.error("Server Action getMarketplaceListings Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getListing(listingId: string) {
    try {
        const db = getAdminFirestore();
        const doc = await db.collection("market_listings").doc(listingId).get();

        if (!doc.exists) {
            return { success: false, error: "Listing not found" };
        }

        const data = doc.data();

        // Fetch owner presence
        let ownerLastSeen = null;
        if (data?.userId) {
            const userDoc = await db.collection("users").doc(data.userId).get();
            if (userDoc.exists) {
                ownerLastSeen = userDoc.data()?.lastSeen?.toDate() || null;
            }
        }

        return {
            success: true,
            listing: {
                id: doc.id,
                ...data,
                listedAt: data?.listedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                ownerLastSeen: ownerLastSeen ? ownerLastSeen.toISOString() : null
            }
        };
    } catch (error: any) {
        console.error("Server Action getListing Error:", error);
        return { success: false, error: error.message };
    }
}

export async function unlistPetFromMarketplace(petId: string) {
    const session = await getSession();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const db = getAdminFirestore();

        // 1. Find and delete listing
        const listingsRef = db.collection("market_listings");
        const snapshot = await listingsRef.where("petId", "==", petId).get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 2. Update pet status
        const petRef = db.collection("user_pets").doc(petId);
        batch.update(petRef, {
            listedInMarketplace: false
        });

        await batch.commit();

        revalidatePath('/my-pets');
        return { success: true };
    } catch (error: any) {
        console.error("Server Action unlistPetFromMarketplace Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deletePet(petId: string) {
    const session = await getSession();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const db = getAdminFirestore();
        const batch = db.batch();

        // 1. Delete pet document
        const petRef = db.collection("user_pets").doc(petId);
        batch.delete(petRef);

        // 2. Delete any associated marketplace listings
        const listingsRef = db.collection("market_listings");
        const snapshot = await listingsRef.where("petId", "==", petId).get();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        revalidatePath('/my-pets');
        return { success: true };
    } catch (error: any) {
        console.error("Server Action deletePet Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateLastSeen() {
    const session = await getSession();
    if (!session?.user?.id) return;

    try {
        const db = getAdminFirestore();
        await db.collection("users").doc(session.user.id).set({
            lastSeen: new Date(),
            updatedAt: new Date()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error updating last seen:", error);
        return { success: false };
    }
}

export async function getUserProfile(): Promise<{ success: boolean; profile?: any; error?: string }> {
    const session = await getSession();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const db = getAdminFirestore();
        const doc = await db.collection("users").doc(session.user.id).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                success: true,
                profile: {
                    ...data,
                    lastSeen: data?.lastSeen?.toDate?.()?.toISOString() || null,
                    updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null
                }
            };
        } return { success: false, error: "Profile not found" };
    } catch (error: any) {
        console.error("Error fetching user profile:", error);
        return { success: false, error: error.message };
    }
}
