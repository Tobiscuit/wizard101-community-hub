import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp, addDoc } from "firebase/firestore";
import { MarketplaceListing, MarketOrder } from "@/types/firestore";

import { MOCK_LISTINGS } from "./mock-listings";

// --- Listings ---

export async function getListings(type?: string) {
    try {
        const ref = collection(db, "market_listings");
        let q = query(ref, where("status", "==", "active"), orderBy("createdAt", "desc"));
        
        if (type && type !== 'all') {
            q = query(ref, where("status", "==", "active"), where("type", "==", type), orderBy("createdAt", "desc"));
        }
        
        const snap = await getDocs(q);
        const realListings = snap.docs.map(d => d.data() as MarketplaceListing);
        
        // Merge with Mocks (Real first, then Mocks)
        return [...realListings, ...MOCK_LISTINGS];
    } catch (error) {
        console.warn("Firestore Query Failed (Using Mocks Only):", error);
        return MOCK_LISTINGS;
    }
}

export async function createListing(uid: string, username: string, data: Partial<MarketplaceListing>) {
    const ref = doc(collection(db, "market_listings"));
    
    const listing: MarketplaceListing = {
        id: ref.id,
        sellerId: uid,
        sellerName: username,
        type: data.type || 'tc_pack',
        title: data.title || 'Unknown Item',
        description: data.description || '',
        batchSize: data.batchSize || 1,
        availableBatches: data.availableBatches || 1,
        allowPartial: data.allowPartial || false,
        currency: (data.currency as any) || 'empowers',
        pricePerUnit: data.pricePerUnit || undefined,
        pricePerBatch: data.pricePerBatch || undefined,
        status: 'active',
        createdAt: serverTimestamp() as Timestamp
    };
    
    await setDoc(ref, listing);
    return listing;
}

// --- Orders (The Ping System) ---

export async function createOrder(listing: MarketplaceListing, buyerId: string, amount: number) {
    const ref = doc(collection(db, "market_orders"));
    
    if (listing.availableBatches < amount) throw new Error("Not enough stock");

    const totalPrice = listing.pricePerUnit 
        ? listing.pricePerUnit * amount 
        : (listing.pricePerBatch || 0) * amount; // Simplified for batch logic

    const order: MarketOrder = {
        id: ref.id,
        listingId: listing.id,
        buyerId,
        sellerId: listing.sellerId,
        amount,
        totalPrice,
        currency: listing.currency,
        status: 'pending',
        history: [{
            senderId: 'system',
            text: `Order requested for ${amount}x ${listing.title}.`,
            timestamp: Timestamp.now()
        }],
        createdAt: serverTimestamp() as Timestamp
    };

    await setDoc(ref, order);
    return order;
}

export async function updateOrderStatus(
    orderId: string, 
    status: MarketOrder['status'], 
    message?: string,
    proposedTime?: Date
) {
    const ref = doc(db, "market_orders", orderId);
    
    const update: any = { status };

    // Handling Specific Status Transitions
    if (status === 'processing') {
        // Start 15m Timer
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 15);
        update.expiresAt = Timestamp.fromDate(expires);
    }
    
    if (status === 'busy' && proposedTime) {
        update.proposedTime = Timestamp.fromDate(proposedTime);
    }

    if (status === 'scheduled') {
        // Buyer confirmed time
        // update.scheduledTime = ... (Usually passed or copied from proposed)
    }

    // Append History Message
    if (message) {
        // Note: Firestore arrayUnion is cleaner but for simplicity matching schema
        // We'd need to fetch current history or use arrayUnion
        // doing simple update for now, ideally use arrayUnion
    }

    await updateDoc(ref, update);
}

export async function getMyOrders(uid: string) {
    // Determine if buyer or seller
    // Simplified: Get all where I am involved
    // Need composite index for OR queries usually, so separate for now
    const buyerQ = query(collection(db, "market_orders"), where("buyerId", "==", uid), orderBy("createdAt", "desc"));
    const sellerQ = query(collection(db, "market_orders"), where("sellerId", "==", uid), orderBy("createdAt", "desc"));
    
    const [bSnap, sSnap] = await Promise.all([getDocs(buyerQ), getDocs(sellerQ)]);
    return [...bSnap.docs.map(d => d.data()), ...sSnap.docs.map(d => d.data())] as MarketOrder[];
}
