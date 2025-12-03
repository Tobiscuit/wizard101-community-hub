'use client';

import React, { useEffect, useState } from 'react';
import { Spellbook } from '@/components/Spellbook';
import { ContactModal } from '@/components/ContactModal';
import { useSession } from 'next-auth/react';
import { Search, Filter, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { getMarketplaceListings } from '@/app/actions';
import { calculateTalentValue, applyJewelBonus } from '@/lib/talent-formulas';

export default function MarketplacePage() {
    const { data: session } = useSession();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [schoolFilter, setSchoolFilter] = useState<string>('All');
    const [selectedListing, setSelectedListing] = useState<any>(null);

    useEffect(() => {
        async function fetchListings() {
            try {
                const result = await getMarketplaceListings();
                if (result.success && result.listings) {
                    let filtered = result.listings;
                    if (schoolFilter !== 'All') {
                        filtered = filtered.filter((l: any) => l.petSchool === schoolFilter);
                    }
                    setListings(filtered);
                }
            } catch (error) {
                console.error("Error fetching marketplace listings:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, [schoolFilter]);

    const SCHOOLS = ["All", "Fire", "Ice", "Storm", "Life", "Myth", "Death", "Balance"];

    const isMaxStats = (stats: any) => {
        if (!stats) return false;
        return stats.strength >= 255 && stats.intellect >= 250 && stats.agility >= 260 && stats.will >= 260 && stats.power >= 250;
    };

    const SET_BONUS_PETS = ["Scaly Frillasaur", "Scratchy Frillasaur", "Stompy Frillasaur", "Snappy Frillasaur"];

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans">
            <Spellbook title="Hatching Kiosk">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-accent-gold/20">
                    <div className="flex items-center gap-2 text-accent-gold font-bold">
                        <Filter className="w-5 h-5" />
                        Filters:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SCHOOLS.map(school => (
                            <button
                                key={school}
                                onClick={() => setSchoolFilter(school)}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-sm transition-all border",
                                    schoolFilter === school
                                        ? "bg-accent-gold text-black border-accent-gold shadow-md font-bold"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                                )}
                            >
                                {school}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-white/70">Summoning listings...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12 text-white/60">
                        <p className="text-xl font-serif mb-4">The Kiosk is empty.</p>
                        <p>Be the first to list a pet from your tome!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-accent-gold/30 hover:border-accent-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all relative group flex flex-col">

                                {/* Status Bar (Badges) */}
                                <div className="flex flex-wrap gap-2 mb-3 justify-end">
                                    {listing.price?.type === 'Free' ? (
                                        <div className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] font-bold shadow-sm border border-blue-300 uppercase tracking-wider">
                                            Lending
                                        </div>
                                    ) : (
                                        <div className="px-2 py-0.5 bg-accent-gold text-black rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                            {listing.price?.amount} {listing.price?.type}
                                        </div>
                                    )}
                                    {isMaxStats(listing.maxPossibleStats) && (
                                        <div className="px-2 py-0.5 bg-purple-500 text-white rounded text-[10px] font-bold shadow-sm border border-purple-300 animate-pulse uppercase tracking-wider">
                                            2.0 Stats
                                        </div>
                                    )}
                                    {SET_BONUS_PETS.includes(listing.petType) && (
                                        <div className="px-2 py-0.5 bg-green-600 text-white rounded text-[10px] font-bold shadow-sm border border-green-400 uppercase tracking-wider">
                                            Set Bonus
                                        </div>
                                    )}
                                </div>

                                {/* Header */}
                                <div className="mb-4">
                                    <h3 className="font-serif font-bold text-xl text-accent-gold mb-1 tracking-wide leading-tight">
                                        {listing.petType}
                                    </h3>
                                    <div className="flex gap-2 text-xs text-white/60">
                                        <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">{listing.petSchool}</span>
                                        <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">{listing.petAge}</span>
                                    </div>
                                </div>

                                {/* Talents Grid */}
                                <div className="flex-1 mb-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {listing.talents?.slice(0, 5).map((talent: string, i: number) => {
                                            // Calculate effective stats with jewel
                                            const effectiveStats = applyJewelBonus(listing.currentStats, listing.socketedJewel);
                                            const val = calculateTalentValue(talent, effectiveStats);

                                            return (
                                                <span key={i} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded flex items-center gap-1.5">
                                                    {talent}
                                                    {val && <span className="text-accent-gold font-mono font-bold">({val})</span>}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors shadow-lg text-sm font-bold"
                                    onClick={() => setSelectedListing(listing)}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Request Hatch
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Spellbook>

            <ContactModal
                isOpen={!!selectedListing}
                onClose={() => setSelectedListing(null)}
                listing={selectedListing}
                currentUserId={session?.user?.id}
            />
        </main>
    );
}
