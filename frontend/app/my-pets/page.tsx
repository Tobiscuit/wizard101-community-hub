'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Spellbook } from '@/components/Spellbook';
import { Plus, Loader2, Store, Check } from 'lucide-react';
import Link from 'next/link';
import { getPets, listPetInMarketplace } from '@/app/actions';
import { PetDetailsModal } from '@/components/PetDetailsModal';

export default function MyPetsPage() {
    const { data: session, status } = useSession();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState<any>(null);

    useEffect(() => {
        async function fetchPets() {
            if (session?.user?.id) {
                try {
                    const result = await getPets();
                    if (result.success && result.pets) {
                        setPets(result.pets);
                    }
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
        try {
            const result = await listPetInMarketplace(pet.id, {
                petType: pet.petType,
                petSchool: pet.petSchool,
                petAge: pet.petAge,
                currentStats: pet.currentStats,
                maxPossibleStats: pet.maxPossibleStats,
                talents: pet.talents,
                calculatedDamage: "TBD",
                calculatedResist: "TBD"
            });

            if (result.success) {
                setPets(prev => prev.map(p => p.id === pet.id ? { ...p, listedInMarketplace: true } : p));
                alert("Pet listed successfully!");
                if (selectedPet?.id === pet.id) {
                    setSelectedPet((prev: any) => ({ ...prev, listedInMarketplace: true }));
                }
            } else {
                throw new Error(result.error);
            }
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

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-serif text-accent-gold mb-4">My Pet Tome</h1>
                <p className="text-foreground/80 mb-6">Please login to view your saved pets.</p>
                <Link href="/api/auth/signin" className="px-6 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90">
                    Login
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans">
            <Spellbook title="My Pet Tome">
                {pets.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">
                        <p className="text-xl font-serif mb-4">Your tome is empty.</p>
                        <Link href="/" className="inline-flex items-center gap-2 text-accent-blue hover:underline">
                            <Plus className="w-4 h-4" />
                            Scan your first pet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pets.map((pet) => (
                            <div
                                key={pet.id}
                                onClick={() => setSelectedPet(pet)}
                                className="bg-white/60 p-4 rounded-lg border border-accent-gold/30 hover:shadow-lg transition-all cursor-pointer group relative"
                            >
                                {pet.listedInMarketplace && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-accent-gold text-white text-xs rounded font-bold shadow-sm z-10">
                                        Listed
                                    </div>
                                )}

                                <h3 className="font-bold text-lg text-accent-gold mb-1 group-hover:text-accent-blue transition-colors">
                                    {pet.petNickname || pet.petType}
                                </h3>
                                <div className="flex gap-2 text-sm text-foreground/70 mb-3">
                                    <span className="px-2 py-0.5 bg-white/50 rounded border border-black/5">{pet.petSchool}</span>
                                    <span className="px-2 py-0.5 bg-white/50 rounded border border-black/5">{pet.petAge}</span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {pet.talents?.slice(0, 3).map((talent: string, i: number) => (
                                        <span key={i} className="text-xs px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue rounded">
                                            {talent}
                                        </span>
                                    ))}
                                    {pet.talents?.length > 3 && (
                                        <span className="text-xs px-1.5 py-0.5 text-foreground/50">
                                            +{pet.talents.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Spellbook>

            {/* Pet Details Modal */}
            {selectedPet && (
                <PetDetailsModal
                    pet={selectedPet}
                    onClose={() => setSelectedPet(null)}
                    onListInMarketplace={handleListPet}
                />
            )}
        </main>
    );
}
