'use client';

import React, { useEffect, useState } from 'react';
import { Spellbook } from '@/components/Spellbook';
import { ContactModal } from '@/components/ContactModal';
import { useSession } from 'next-auth/react';
import { Search, Filter, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { getMarketplaceListings } from '@/app/actions';

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
                        <div key={listing.id} className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-accent-gold/30 hover:border-accent-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all relative group">
                            <div className="absolute top-2 right-2 px-2 py-1 bg-accent-gold text-black rounded text-xs font-bold shadow-sm">
                                {listing.price?.amount} {listing.price?.type}
                            </div>

                            <h3 className="font-serif font-bold text-xl text-accent-gold mb-1 tracking-wide">{listing.petType}</h3>
                            <div className="flex gap-2 text-sm text-white/70 mb-4">
                                <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{listing.petSchool}</span>
                                <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{listing.petAge}</span>
                            </div>

                            <div className="space-y-2 mb-4 p-3 bg-white/5 rounded border border-white/5">
                                <div className="flex justify-between text-sm text-white/90">
                                    <span className="text-white/60">Damage:</span>
                                    <span className="font-mono font-bold text-red-300">{listing.calculatedDamage}</span>
                                </div>
                                <div className="flex justify-between text-sm text-white/90">
                                    <span className="text-white/60">Resist:</span>
                                    <span className="font-mono font-bold text-blue-300">{listing.calculatedResist}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {listing.talents?.slice(0, 5).map((talent: string, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded">
                                        {talent}
                                    </span>
                                ))}
                            </div>

                            <button
                                className="w-full flex items-center justify-center gap-2 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors shadow-lg"
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
