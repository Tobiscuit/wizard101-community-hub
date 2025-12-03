'use server';

import { auth } from "@/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { calculateAllPotentials, applyJewelBonus } from "@/lib/talent-formulas";

export async function savePet(petData: any) {
    const session = await auth();

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
    const session = await auth();

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

        return { success: true, pets };
    } catch (error: any) {
        console.error("Server Action getPets Error:", error);
        return { success: false, error: error.message };
    }
}

export async function listPetInMarketplace(petId: string, listingData: any, discordUsername?: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const db = getAdminFirestore();

        // Check for existing Discord ID or Username
        // In a real app with linked accounts, we'd check session.user.discordId
        // For now, we check if the user provided a username OR if we have one saved in their profile

        let finalDiscordContact = discordUsername;

        // If no username provided, check if we already have one saved (optional optimization, 
        // but for now we'll rely on the client sending it if needed, or just saving it now)

        if (discordUsername) {
            // Save/Update the user's preferred Discord username for future use
            await db.collection("users").doc(session.user.id).set({
                discordUsername: discordUsername,
                updatedAt: new Date()
            }, { merge: true });
        } else {
            // Try to fetch from profile if not provided
            const userDoc = await db.collection("users").doc(session.user.id).get();
            if (userDoc.exists && userDoc.data()?.discordUsername) {
                finalDiscordContact = userDoc.data()?.discordUsername;
            }
        }

        // If we still don't have a contact, check if the session has a Discord ID (from OAuth)
        // Note: NextAuth session might not expose the raw provider ID easily without callbacks,
        // but let's assume if they logged in with Discord, we might have it.
        // For this strict requirement, we fail if we have NOTHING.

        // Actually, if they logged in with Discord, the email might be a hint, but user explicitly said NO EMAIL.
        // So we strictly require a Discord Username or ID.

        if (!finalDiscordContact) {
            // If they logged in via Discord, maybe we can use their name? 
            // But "Discord Username" input is safer for Google users.
            throw new Error("A Discord Username is required to list pets in the Kiosk.");
        }

        // 1. Apply Jewel Bonus if present
        const statsToCalculate = applyJewelBonus(listingData.currentStats, listingData.socketedJewel);

        // 2. Calculate stats
        const potentials = calculateAllPotentials(statsToCalculate);

        // 3. Create listing
        await db.collection("marketplace_listings").add({
            petId: petId,
            userId: session.user.id,
            ownerDisplayName: session.user.name || "Unknown Wizard",
            ownerContact: {
                discord: finalDiscordContact, // ONLY Discord
                // NO EMAIL FALLBACK
            },
            ...listingData,
            calculatedDamage: `${potentials.damage.dealer}%`,
            calculatedResist: `${potentials.resist.proof}%`,
            price: listingData.price || {
                type: "Empowers",
                amount: 50
            },
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
        const listingsRef = db.collection("marketplace_listings");
        const snapshot = await listingsRef.orderBy("listedAt", "desc").limit(50).get();

        const listings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            listedAt: doc.data().listedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));

        return { success: true, listings };
    } catch (error: any) {
        console.error("Server Action getMarketplaceListings Error:", error);
        return { success: false, error: error.message };
    }
}

export async function unlistPetFromMarketplace(petId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const db = getAdminFirestore();

        // 1. Find and delete listing
        const listingsRef = db.collection("marketplace_listings");
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
