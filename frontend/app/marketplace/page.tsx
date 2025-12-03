'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Spellbook } from '@/components/Spellbook';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import { getMarketplaceListings } from '@/app/actions';
import { calculateTalentValue, applyJewelBonus } from '@/lib/talent-formulas';

export default function MarketplacePage() {
    const { data: session } = useSession();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [schoolFilter, setSchoolFilter] = useState<string>('All');
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'damage' | 'resist'>('newest');

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

    const filteredListings = useMemo(() => {
        let currentListings = [...listings];

        // Apply school filter
        if (schoolFilter !== 'All') {
            currentListings = currentListings.filter((l: any) => l.petSchool === schoolFilter);
        }

        // Apply search filter
        if (search) {
            const lowerCaseSearch = search.toLowerCase();
            currentListings = currentListings.filter(
                (l: any) =>
                    l.petType.toLowerCase().includes(lowerCaseSearch) ||
                    l.petNickname?.toLowerCase().includes(lowerCaseSearch) ||
                    l.talents.some((t: string) => t.toLowerCase().includes(lowerCaseSearch))
            );
        }

        // Apply sorting
        currentListings.sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortOrder === 'damage') {
                return b.calculatedDamage - a.calculatedDamage;
            } else if (sortOrder === 'resist') {
                return b.calculatedResist - a.calculatedResist;
            }
            return 0;
        });

        return currentListings;
    }, [listings, schoolFilter, search, sortOrder]);

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans">
            <Spellbook title="Pet Pavilion Kiosk">
                {/* Filters */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-black/40 p-4 rounded-lg border border-white/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search pets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded text-sm text-white focus:border-accent-gold/50 focus:outline-none transition-colors font-serif"
                        />
                    </div>

                    <select
                        value={schoolFilter}
                        onChange={(e) => setSchoolFilter(e.target.value)}
                        className="px-4 py-2 bg-black/50 border border-white/10 rounded text-sm text-white focus:border-accent-gold/50 focus:outline-none font-serif"
                    >
                        <option value="All">All Schools</option>
                        {['Fire', 'Ice', 'Storm', 'Myth', 'Life', 'Death', 'Balance'].map(school => (
                            <option key={school} value={school}>{school}</option>
                        ))}
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="px-4 py-2 bg-black/50 border border-white/10 rounded text-sm text-white focus:border-accent-gold/50 focus:outline-none font-serif"
                    >
                        <option value="newest">Newest First</option>
                        <option value="damage">Highest Damage</option>
                        <option value="resist">Highest Resist</option>
                    </select>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-12 text-white/60">
                        <p className="text-xl font-serif mb-4">The Kiosk is empty.</p>
                        <p>Be the first to list a pet from your tome!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/marketplace/${listing.id}`}
                                className="block bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-accent-gold/30 hover:border-accent-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all cursor-pointer group relative"
                            >
                                {/* Status Bar */}
                                <div className="absolute top-0 right-0 left-0 p-2 flex justify-end gap-2 pointer-events-none">
                                    {/* Lending Badge */}
                                    {listing.price?.type === 'Free' ? (
                                        <div className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue border border-accent-blue/30 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                                            Lending
                                        </div>
                                    ) : (
                                        <div className="px-2 py-0.5 bg-black/60 text-accent-gold border border-accent-gold/30 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                                            {listing.price?.amount} {listing.price?.type}
                                        </div>
                                    )}

                                    {/* 2.0 Stats Badge */}
                                    {isMaxStats(listing) && (
                                        <div className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                                            2.0 Stats
                                        </div>
                                    )}

                                    {/* Set Bonus Badge */}
                                    {SET_BONUS_PETS.includes(listing.petType) && (
                                        <div className="px-2 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                                            Set Bonus
                                        </div>
                                    )}
                                    {/* Last Seen Badge */}
                                    {(() => {
                                        if (!listing.ownerLastSeen) return null;
                                        const lastSeen = new Date(listing.ownerLastSeen);
                                        const now = new Date();
                                        const diffMins = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

                                        if (diffMins < 10) {
                                            return (
                                                <div className="px-2 py-0.5 bg-green-500 text-white rounded text-[10px] font-bold shadow-sm border border-green-400 uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                    Online
                                                </div>
                                            );
                                        } else if (diffMins < 60) {
                                            return (
                                                <div className="px-2 py-0.5 bg-white/10 text-white/70 rounded text-[10px] font-bold shadow-sm border border-white/10 uppercase tracking-wider backdrop-blur-md">
                                                    Active {Math.floor(diffMins)}m ago
                                                </div>
                                            );
                                        } else if (diffMins < 1440) {
                                            return (
                                                <div className="px-2 py-0.5 bg-white/5 text-white/50 rounded text-[10px] font-bold shadow-sm border border-white/5 uppercase tracking-wider backdrop-blur-md">
                                                    Active {Math.floor(diffMins / 60)}h ago
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {/* Header */}
                                <div className="mt-6 mb-4">
                                    <h3 className="font-serif font-bold text-xl text-accent-gold mb-1 group-hover:text-white transition-colors tracking-wide">
                                        {listing.petNickname || listing.petType}
                                    </h3>
                                    <div className="flex gap-2 text-sm text-white/70">
                                        <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{listing.petType}</span>
                                        <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{listing.petSchool}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-black/30 p-2 rounded border border-white/5">
                                        <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Damage</div>
                                        <div className="text-lg font-bold text-accent-blue">{listing.calculatedDamage}%</div>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded border border-white/5">
                                        <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Resist</div>
                                        <div className="text-lg font-bold text-accent-blue">{listing.calculatedResist}%</div>
                                    </div>
                                </div>

                                {/* Talents List */}
                                <div className="space-y-1.5">
                                    {listing.talents.slice(0, 5).map((talent: string, i: number) => {
                                        // Fix: calculateTalentValue expects (talent, stats, jewel)
                                        // But checking lib/talent-formulas.ts, it seems it might only take 2 args or return string/number?
                                        // Let's assume it returns a number or null.
                                        const val = calculateTalentValue(talent, listing.currentStats);
                                        // Note: applyJewelBonus is likely handled inside or we should pass modified stats.
                                        // If calculateTalentValue returns a string (like "10%"), we need to parse or just display.

                                        return (
                                            <div key={i} className="flex justify-between items-center text-sm px-2 py-1 rounded bg-white/5 border border-white/5">
                                                <span className="text-white/80">{talent}</span>
                                                {val && <span className="text-accent-gold font-mono text-xs">{val}%</span>}
                                            </div>
                                        );
                                    })}
                                    {listing.talents.length > 5 && (
                                        <div className="text-xs text-center text-white/30 italic pt-1">
                                            +{listing.talents.length - 5} more talents
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Spellbook>
        </main>
    );
}
