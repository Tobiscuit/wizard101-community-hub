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

                                {pet.ownerContact?.discordId ? (
                                    <a
                                        href={`https://discord.com/users/${pet.ownerContact.discordId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-lg transition-colors shadow-lg mb-4"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                        </svg>
                                        Message on Discord
                                    </a>
                                ) : pet.ownerContact?.discordUsername ? (
                                    <div className="bg-black/50 p-4 rounded border border-white/10 select-all font-mono text-lg mb-4">
                                        {pet.ownerContact.discordUsername}
                                    </div>
                                ) : null}

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
