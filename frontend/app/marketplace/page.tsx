'use client';

import React, { useEffect, useState } from 'react';
import { Spellbook } from '@/components/Spellbook';
import { Search, Filter, MessageCircle } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { clsx } from 'clsx';

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [schoolFilter, setSchoolFilter] = useState<string>('All');

    useEffect(() => {
        async function fetchListings() {
            try {
                let q = query(
                    collection(db, "marketplace_listings"),
                    orderBy("listedAt", "desc"),
                    limit(50)
                );

                if (schoolFilter !== 'All') {
                    q = query(
                        collection(db, "marketplace_listings"),
                        where("petSchool", "==", schoolFilter),
                        orderBy("listedAt", "desc"),
                        limit(50)
                    );
                }

                const querySnapshot = await getDocs(q);
                const fetchedListings = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setListings(fetchedListings);
            } catch (error) {
                console.error("Error fetching marketplace listings:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, [schoolFilter]);

    const SCHOOLS = ["All", "Fire", "Ice", "Storm", "Life", "Myth", "Death", "Balance"];

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans">
            <Spellbook title="Hatching Kiosk">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white/30 rounded-lg border border-accent-gold/20">
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
                                    "px-3 py-1 rounded-full text-sm transition-all",
                                    schoolFilter === school
                                        ? "bg-accent-gold text-white shadow-md"
                                        : "bg-white/50 hover:bg-white/80 text-foreground/80"
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
                        <p>Summoning listings...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">
                        <p className="text-xl font-serif mb-4">The Kiosk is empty.</p>
                        <p>Be the first to list a pet from your tome!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-white/60 p-4 rounded-lg border border-accent-gold/30 hover:shadow-lg transition-shadow relative group">
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/10 rounded text-xs font-bold">
                                    {listing.price?.amount} {listing.price?.type}
                                </div>

                                <h3 className="font-bold text-lg text-accent-gold mb-1">{listing.petType}</h3>
                                <div className="flex gap-2 text-sm text-foreground/70 mb-3">
                                    <span className="px-2 py-0.5 bg-white/50 rounded border border-black/5">{listing.petSchool}</span>
                                    <span className="px-2 py-0.5 bg-white/50 rounded border border-black/5">{listing.petAge}</span>
                                </div>

                                <div className="space-y-1 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Damage:</span>
                                        <span className="font-bold">{listing.calculatedDamage}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Resist:</span>
                                        <span className="font-bold">{listing.calculatedResist}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {listing.talents?.slice(0, 5).map((talent: string, i: number) => (
                                        <span key={i} className="text-xs px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue rounded">
                                            {talent}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors"
                                    onClick={() => {
                                        if (listing.ownerContact?.discordUserId) {
                                            window.open(`https://discord.com/users/${listing.ownerContact.discordUserId}`, '_blank');
                                        } else {
                                            alert(`Contact ${listing.ownerDisplayName} on Discord: ${listing.ownerContact?.discord}`);
                                        }
                                    }}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Request Hatch
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Spellbook>
        </main>
    );
}
