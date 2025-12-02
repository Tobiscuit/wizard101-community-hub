'use server';

import { auth } from "@/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

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
