'use server';

import { auth } from "@/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { ForumThread, ForumCategory } from "@/types/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export type CreateThreadInput = {
    title: string;
    content: string;
    category: ForumCategory;
    authorWizardId?: string; // If null, posts as "User" (fallback)
    authorWizardName?: string; // Snapshot
    attachedAsset?: {
        type: 'wizard' | 'pet' | 'item';
        id: string;
        snapshot: any;
    };
    tags: string[];
};

export async function createThread(input: CreateThreadInput) {
    const session = await auth();
    
    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in to post." };
    }

    const { title, content, category, authorWizardId, authorWizardName, attachedAsset, tags } = input;

    if (!title || !content || !category) {
        return { success: false, error: "Missing required fields." };
    }

    // Basic Validation
    if (title.length > 100) return { success: false, error: "Title is too long (max 100 chars)." };
    if (content.length > 5000) return { success: false, error: "Content is too long (max 5000 chars)." };

    const db = getAdminFirestore();
    
    try {
        const threadRef = db.collection('threads').doc();
        
        const newThread: Partial<ForumThread> = {
            id: threadRef.id,
            authorId: session.user.id,
            authorName: session.user.name || "Unknown Wizard", // Default to NextAuth name
            authorWizardId: authorWizardId || undefined,
            // If a wizard persona is selected, override the display name, otherwise use User name
            // Actually, we usually want to show BOTH or just the Persona. 
            // Let's store the Persona Name separately so UI can decide: "Wolf StormBlade (Jrami)"
            
            category,
            title,
            content,
            attachedAsset,
            tags: tags.slice(0, 5), // Max 5 tags

            viewCount: 0,
            replyCount: 0,
            lastReplyAt: FieldValue.serverTimestamp() as any, // Initial sort
            
            isPinned: false,
            isLocked: false,
            
            createdAt: FieldValue.serverTimestamp() as any,
            updatedAt: FieldValue.serverTimestamp() as any,
        };

        await threadRef.set(newThread);

        revalidatePath('/olde-town');
        revalidatePath(`/olde-town/${category}`);
        
        return { success: true, threadId: threadRef.id };

    } catch (error) {
        console.error("Error creating thread:", error);
        return { success: false, error: "Failed to post thread. Please try again." };
    }
}
