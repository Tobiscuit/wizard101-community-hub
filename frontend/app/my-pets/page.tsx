'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Spellbook } from '@/components/Spellbook';
import { Plus, Loader2, Store, Check } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MyPetsPage() {
    const { data: session, status } = useSession();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [listingPetId, setListingPetId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPets() {
            if (session?.user?.id) {
                try {
                    const q = query(
                        collection(db, "user_pets"),
                        where("userId", "==", session.user.id)
                    );
                    const querySnapshot = await getDocs(q);
                    const fetchedPets = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setPets(fetchedPets);
                } catch (error) {
                    console.error("Error fetching pets:", error);
                } finally {
                    setLoading(false);
                }
            } else if (status === 'unauthenticated') {
                setLoading(false);
            }
        }

        fetchPets();
    }, [session, status]);

    const handleListPet = async (pet: any) => {
        if (!confirm(`List ${pet.petNickname || pet.petType} in the marketplace?`)) return;

        try {
            // 1. Create listing
            await addDoc(collection(db, "marketplace_listings"), {
                petId: pet.id,
                userId: session?.user?.id,
                ownerDisplayName: session?.user?.name || "Unknown Wizard",
                ownerContact: {
                    discord: session?.user?.email, // Fallback for now
                    // discordUserId: session?.user?.id // TODO: Get from NextAuth session callback
                },
                petType: pet.petType,
                petSchool: pet.petSchool,
                petAge: pet.petAge,
                currentStats: pet.currentStats,
                maxPossibleStats: pet.maxPossibleStats,
                talents: pet.talents,
                calculatedDamage: "TBD", // TODO: Calculate
                calculatedResist: "TBD",
                price: {
                    type: "Empowers",
                    amount: 50 // Default
                },
                listedAt: serverTimestamp()
            });

            // 2. Update pet status
            await updateDoc(doc(db, "user_pets", pet.id), {
                listedInMarketplace: true
            });

            // 3. Update local state
            setPets(prev => prev.map(p => p.id === pet.id ? { ...p, listedInMarketplace: true } : p));

            alert("Pet listed successfully!");
        } catch (error) {
            console.error("Error listing pet:", error);
            alert("Failed to list pet.");
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans">
            <Spellbook title="My Pets">
                <div className="flex justify-end mb-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Pet
                    </Link>
                </div>

                {pets.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">
                        <p className="text-xl font-serif mb-4">No pets in your tome yet.</p>
                        <p>Go to the calculator to scan and save your first pet!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pets.map((pet) => (
                            <div key={pet.id} className="bg-white/40 p-4 rounded-lg border border-accent-gold/30 relative">
                                <h3 className="font-bold text-lg text-accent-gold">{pet.petNickname || pet.petType}</h3>
                                <p className="text-sm text-foreground/70 mb-4">{pet.petSchool} • {pet.petAge}</p>

                                {pet.listedInMarketplace ? (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-100 px-3 py-1 rounded-full w-fit">
                                        <Check className="w-4 h-4" />
                                        Listed
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleListPet(pet)}
                                        className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-white rounded hover:bg-accent-gold/90 transition-colors text-sm"
                                    >
                                        <Store className="w-4 h-4" />
                                        List in Kiosk
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Spellbook>
        </main>
    );
}
