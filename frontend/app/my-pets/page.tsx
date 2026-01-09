'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { GridPattern } from "@/components/magicui/grid-pattern"
import { MagicCard } from "@/components/magicui/magic-card"
import { PetDetailDialog } from '@/components/pet-detail-dialog';
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Sword, Shield, Crosshair } from 'lucide-react';
import Link from 'next/link';
import { getPets, listPetInMarketplace, unlistPetFromMarketplace, deletePet, getUserProfile } from '@/app/actions';
import { calculateTalentValue, calculateAllPotentials } from '@/lib/talent-formulas';


import { ListingConfigurationModal, ListingConfig } from '@/components/ListingConfigurationModal';


function formatPetName(name: string) {
    if (!name) return "";
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function MyPetsPage() {
    const { data: session, isPending } = useSession();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [listingConfigPet, setListingConfigPet] = useState<any>(null);
    const [discordUsername, setDiscordUsername] = useState<string>('');
    const [hasDiscordId, setHasDiscordId] = useState<boolean>(false);

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

                    if (profileResult.success && profileResult.profile) {
                        if (profileResult.profile.discordUsername) {
                            setDiscordUsername(profileResult.profile.discordUsername);
                        }
                        if (profileResult.profile.discordId) {
                            setHasDiscordId(true);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!isPending && !session) {
                setLoading(false);
            }
        }

        fetchData();
    }, [session, isPending]);

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

    if (isPending || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-serif text-accent-gold mb-4">My Pets</h1>
                <p className="text-foreground/80 mb-6">Please login to view your saved pets.</p>
                <Link href="/login">
                    <Button>Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full">
            <GridPattern
                width={30}
                height={30}
                x={-1}
                y={-1}
                className="stroke-gray-400/20 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
                strokeDasharray="4 2"
            />

            <div className="container mx-auto max-w-7xl pt-8 pb-16 px-4 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground drop-shadow-md">
                        My <span className="text-accent-gold">Pets</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl font-light">
                        Manage your collection, list pets for hatching, and track your legacy.
                    </p>
                </div>

                {pets.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">
                        <p className="text-xl font-serif mb-4">Your tome is empty.</p>
                        <Link href="/" className="inline-flex items-center gap-2 text-accent-blue hover:underline">
                            <Plus className="w-4 h-4" />
                            Scan your first pet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pets.map((pet) => {
                             const stats = pet.stats || pet.currentStats || { strength: 0, intellect: 0, agility: 0, will: 0, power: 0 };
                             return (
                                <MagicCard 
                                    key={pet.id}
                                    onClick={() => setSelectedPet(pet)}
                                    className="cursor-pointer border-accent-gold/20 hover:border-accent-gold/50 transition-all duration-500 flex flex-col p-0 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden h-full group" 
                                    gradientColor="#FFD700" 
                                    gradientOpacity={0.1}
                                >
                                    {pet.listedInMarketplace && (
                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-accent-gold/20 text-accent-gold border border-accent-gold/30 text-[10px] font-bold rounded shadow-sm z-10 uppercase tracking-widest">
                                            Listed
                                        </div>
                                    )}

                                    {/* Card Header area - TIGHTENED SPACING */}
                                    <div className="p-5 pb-2">
                                        <h3 className="font-serif font-bold text-lg text-accent-gold mb-0.5 group-hover:text-foreground transition-colors tracking-wide leading-tight line-clamp-2">
                                            {formatPetName(pet.petNickname || pet.petType)}
                                        </h3>
                                        {/* Pet Type Badge - Always Visible */}
                                        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1.5 opacity-80">
                                            {pet.petType}
                                        </div>

                                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                            <span className="px-2 py-0.5 bg-muted rounded border border-white/5">{pet.petSchool}</span>
                                            <span className="px-2 py-0.5 bg-muted rounded border border-white/5">{pet.petAge}</span>
                                        </div>
                                    
                                        {/* Base Stats Mini-Grid */}
                                        <div className="grid grid-cols-5 gap-1 mt-4 text-center pb-2 border-b border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold">Str</span>
                                                <span className="text-xs font-mono">{stats.strength}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold">Int</span>
                                                <span className="text-xs font-mono">{stats.intellect}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold">Agi</span>
                                                <span className="text-xs font-mono">{stats.agility}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold">Will</span>
                                                <span className="text-xs font-mono">{stats.will}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold">Pow</span>
                                                <span className="text-xs font-mono">{stats.power}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Talents List - Restored as requested */}
                                    <div className="flex-1 p-5 pt-0 flex flex-col gap-2">
                                        {pet.talents?.map((talent: string, i: number) => {
                                            const val = calculateTalentValue(talent, stats);
                                            return (
                                                <div key={i} className="flex justify-between items-center text-xs px-2.5 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-md transition-colors group/talent">
                                                    <span className="font-semibold uppercase truncate text-[10px] tracking-wide text-foreground/80 group-hover/talent:text-foreground transition-colors">{talent}</span>
                                                    {val && <span className="font-mono text-accent-gold/90 text-[10px] whitespace-nowrap ml-1">{val}</span>}
                                                </div>
                                            );
                                        })}
                                        {(!pet.talents || pet.talents.length === 0) && (
                                            <span className="text-xs text-muted-foreground italic p-2 text-center opacity-50">No talents known</span>
                                        )}
                                    </div>
                                    
                                    {/* Bottom aesthetic strip */}
                                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </MagicCard>
                             );
                        })}
                    </div>
                )}
            </div>

            {/* Pet Details Modal */}
            {/* Pet Details Modal */}
            <PetDetailDialog
                pet={selectedPet}
                open={!!selectedPet}
                onClose={() => setSelectedPet(null)}
                onListInMarketplace={handleOpenListingConfig}
                onUnlistFromMarketplace={handleUnlistPet}
                onDelete={handleDeletePet}
            />

            {/* Listing Configuration Modal */}
            <ListingConfigurationModal
                isOpen={!!listingConfigPet}
                onClose={() => setListingConfigPet(null)}
                onConfirm={handleConfirmListing}
                pet={listingConfigPet}
                savedDiscordUsername={discordUsername}
                hasDiscordOAuth={hasDiscordId}
            />
        </div>
    );
}
