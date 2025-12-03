'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Spellbook } from '@/components/Spellbook';
import { Plus, Loader2, Store, Check } from 'lucide-react';
import Link from 'next/link';
import { getPets, listPetInMarketplace, unlistPetFromMarketplace, deletePet, getUserProfile } from '@/app/actions';
import { PetDetailsModal } from '@/components/PetDetailsModal';

import { ListingConfigurationModal, ListingConfig } from '@/components/ListingConfigurationModal';

export default function MyPetsPage() {
    const { data: session, status } = useSession();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [discordUsername, setDiscordUsername] = useState<string>('');

    useEffect(() => {
        async function fetchData() {
            if (session?.user?.id) {
                try {
                    const [petsResult, profileResult] = await Promise.all([
                        getPets(),
                        getUserProfile()
                    ]);

                    if (petsResult.success && petsResult.pets) {
                        setPets(petsResult.pets);
                    }

                    if (profileResult.success && profileResult.profile?.discordUsername) {
                        setDiscordUsername(profileResult.profile.discordUsername);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            } else if (status === 'unauthenticated') {
                setLoading(false);
            }
        }

        fetchData();
    }, [session, status]);

    const handleOpenListingConfig = (pet: any) => {
        setListingConfigPet(pet);
    };

    const handleConfirmListing = async (config: ListingConfig) => {
        if (!listingConfigPet) return;

        try {
            const result = await listPetInMarketplace(listingConfigPet.id, {
                petType: listingConfigPet.petType,
                petSchool: listingConfigPet.petSchool,
                petAge: listingConfigPet.petAge,
                currentStats: listingConfigPet.currentStats,
                maxPossibleStats: listingConfigPet.maxPossibleStats,
                talents: listingConfigPet.talents,
                socketedJewel: config.socketedJewel,
                price: {
                    type: config.priceType,
                    amount: config.priceAmount
                }
            }, config.discordUsername);

            if (result.success) {
                if (config.discordUsername) {
                    setDiscordUsername(config.discordUsername);
                }
                setPets(prev => prev.map(p => p.id === listingConfigPet.id ? { ...p, listedInMarketplace: true } : p));
                alert("Pet listed successfully!");
                if (selectedPet?.id === listingConfigPet.id) {
                    setSelectedPet((prev: any) => ({ ...prev, listedInMarketplace: true }));
                }
                setListingConfigPet(null);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error listing pet:", error);
            alert("Failed to list pet.");
        }
    };

    const handleUnlistPet = async (pet: any) => {
        if (!confirm(`Remove ${pet.petNickname || pet.petType} from the marketplace?`)) return;

        try {
            const result = await unlistPetFromMarketplace(pet.id);

            if (result.success) {
                setPets(prev => prev.map(p => p.id === pet.id ? { ...p, listedInMarketplace: false } : p));
                alert("Pet unlisted successfully!");
                if (selectedPet?.id === pet.id) {
                    setSelectedPet((prev: any) => ({ ...prev, listedInMarketplace: false }));
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error unlisting pet:", error);
            alert("Failed to unlist pet.");
        }
    };

    const handleDeletePet = async (pet: any) => {
        try {
            const result = await deletePet(pet.id);
            if (result.success) {
                setPets(prev => prev.filter(p => p.id !== pet.id));
                setSelectedPet(null);
                alert("Pet released successfully.");
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error deleting pet:", error);
            alert("Failed to delete pet.");
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
                <Link href="/login" className="px-6 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90">
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
                                className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-accent-gold/30 hover:border-accent-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all cursor-pointer group relative"
                            >
                                {pet.listedInMarketplace && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-accent-gold text-black text-xs font-bold rounded shadow-sm z-10">
                                        Listed
                                    </div>
                                )}

                                <h3 className="font-serif font-bold text-xl text-accent-gold mb-1 group-hover:text-white transition-colors tracking-wide">
                                    {pet.petNickname || pet.petType}
                                </h3>
                                <div className="flex gap-2 text-sm text-white/70 mb-4">
                                    <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{pet.petSchool}</span>
                                    <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{pet.petAge}</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {pet.talents?.slice(0, 3).map((talent: string, i: number) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded">
                                            {talent}
                                        </span>
                                    ))}
                                    {pet.talents?.length > 3 && (
                                        <span className="text-xs px-2 py-1 text-white/40 italic">
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
                    onListInMarketplace={handleOpenListingConfig}
                    onUnlistFromMarketplace={handleUnlistPet}
                    onDelete={handleDeletePet}
                />
            )}

            {/* Listing Configuration Modal */}
            <ListingConfigurationModal
                isOpen={!!listingConfigPet}
                onClose={() => setListingConfigPet(null)}
                onConfirm={handleConfirmListing}
                pet={listingConfigPet}
                savedDiscordUsername={discordUsername}
            />
        </main>
    );
}
