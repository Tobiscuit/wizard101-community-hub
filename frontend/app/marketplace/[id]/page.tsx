import { getListing } from '@/app/actions';
import { Spellbook } from '@/components/Spellbook';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import { PetDetailsModal } from '@/components/PetDetailsModal'; // We'll reuse the modal content or similar layout

// We can reuse the card layout or just a simple detail view
export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { success, listing } = await getListing(id);
    const pet = listing as any;

    if (!success || !pet) {
        notFound();
    }

    // For now, we'll render a simple view. 
    // Ideally, we might want to just open the modal, but for a standalone page, a static view is better for SEO/Sharing.

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link href="/marketplace" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Marketplace
                </Link>

                <Spellbook title={`${pet.petNickname || pet.petType} Details`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Stats & Info */}
                        <div className="space-y-6">
                            <div className="bg-black/40 p-6 rounded-lg border border-accent-gold/30">
                                <h2 className="text-2xl font-serif text-accent-gold mb-2">{pet.petNickname}</h2>
                                <p className="text-white/60 text-lg mb-4">{pet.petType}</p>

                                <div className="flex gap-4 mb-6">
                                    <div className="bg-white/10 px-3 py-1 rounded border border-white/10">
                                        {pet.petSchool}
                                    </div>
                                    <div className="bg-white/10 px-3 py-1 rounded border border-white/10">
                                        {pet.petAge}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Damage Potential</span>
                                        <span className="text-xl font-bold text-accent-blue">{pet.calculatedDamage}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Resist Potential</span>
                                        <span className="text-xl font-bold text-accent-blue">{pet.calculatedResist}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Talents */}
                            <div>
                                <h3 className="text-xl font-serif text-white/90 mb-4">Manifested Talents</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {pet.talents.map((talent: string, i: number) => (
                                        <div key={i} className="bg-blue-900/20 border border-blue-500/30 p-3 rounded flex items-center gap-3">
                                            <div className="w-2 h-2 bg-accent-blue rounded-full" />
                                            <span className="text-blue-100">{talent}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Contact & Action */}
                        <div className="space-y-6">
                            <div className="bg-accent-gold/10 border border-accent-gold/30 p-6 rounded-lg text-center">
                                <h3 className="text-xl font-serif text-accent-gold mb-4">Interested in Hatching?</h3>
                                <p className="text-white/70 mb-6">
                                    Contact the owner on Discord to arrange a hatch.
                                </p>
                                <div className="bg-black/50 p-4 rounded border border-white/10 select-all font-mono text-lg mb-4">
                                    {pet.discordUsername}
                                </div>
                                <div className="text-sm text-white/40">
                                    Listing Cost: <span className="text-white">{pet.price?.amount} {pet.price?.type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Spellbook>
            </div>
        </main>
    );
}
