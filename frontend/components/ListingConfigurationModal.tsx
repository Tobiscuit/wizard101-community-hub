'use client';

import React, { useState, useEffect } from 'react';
import { X, Gem, DollarSign, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { calculateAllPotentials } from '@/lib/talent-formulas';
import { MagicalButton } from './MagicalButton';

type ListingConfigurationModalProps = {
    pet: any;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: ListingConfig) => void;
    savedDiscordUsername?: string;
    hasDiscordOAuth?: boolean; // If true, user signed in with Discord (no need to ask for username)
};

export type ListingConfig = {
    priceAmount: number;
    priceType: string;
    socketedJewel: string;
    discordUsername: string;
};

const JEWELS = [
    { id: 'none', name: 'No Jewel', bonus: null },
    { id: 'mighty', name: 'Mighty Opal', bonus: { stat: 'strength', amount: 65 } },
    { id: 'thinking_cap', name: 'Thinking Cap Opal', bonus: { stat: 'will', amount: 65 } },
    { id: 'cautious', name: 'Cautious Opal', bonus: { stat: 'agility', amount: 65 } },
    { id: 'brilliant', name: 'Brilliant Opal', bonus: { stat: 'intellect', amount: 65 } },
    { id: 'powerful', name: 'Powerful Opal', bonus: { stat: 'power', amount: 65 } },
];

export function ListingConfigurationModal({ pet, isOpen, onClose, onConfirm, savedDiscordUsername, hasDiscordOAuth }: ListingConfigurationModalProps) {
    const [priceAmount, setPriceAmount] = useState(50);
    const [priceType, setPriceType] = useState('Empowers');
    const [selectedJewel, setSelectedJewel] = useState('none');
    const [discordUsername, setDiscordUsername] = useState(savedDiscordUsername || '');
    const [previewStats, setPreviewStats] = useState<any>(null);

    useEffect(() => {
        if (pet && pet.currentStats) {
            let stats = { ...pet.currentStats };
            const jewel = JEWELS.find(j => j.id === selectedJewel);

            if (jewel && jewel.bonus) {
                stats[jewel.bonus.stat] += jewel.bonus.amount;
            }

            setPreviewStats(calculateAllPotentials(stats));
        }
    }, [pet, selectedJewel]);

    useEffect(() => {
        if (savedDiscordUsername) {
            setDiscordUsername(savedDiscordUsername);
        }
    }, [savedDiscordUsername]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            priceAmount,
            priceType,
            socketedJewel: selectedJewel,
            discordUsername
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a2e] border-2 border-accent-gold rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-accent-gold/20 flex justify-between items-center">
                    <h2 className="text-2xl font-serif font-bold text-accent-gold">List in Kiosk</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            Asking Price
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={priceAmount}
                                onChange={(e) => setPriceAmount(Number(e.target.value))}
                                className="w-24 bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none"
                                min="0"
                            />
                            <select
                                value={priceType}
                                onChange={(e) => setPriceType(e.target.value)}
                                className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none"
                            >
                                <option value="Empowers">Empowers</option>
                                <option value="Packs">Packs</option>
                                <option value="Gifting">Gifting</option>
                                <option value="Free">Free (Lending)</option>
                            </select>
                        </div>
                    </div>

                    {/* Jewel Socketing */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <Gem className="w-4 h-4 text-purple-400" />
                            Socketed Jewel
                        </label>
                        <select
                            value={selectedJewel}
                            onChange={(e) => setSelectedJewel(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none"
                        >
                            {JEWELS.map(j => (
                                <option key={j.id} value={j.id}>
                                    {j.name} {j.bonus ? `(+${j.bonus.amount} ${j.bonus.stat})` : ''}
                                </option>
                            ))}
                        </select>

                        {/* Stat Preview */}
                        {previewStats && selectedJewel !== 'none' && (
                            <div className="mt-2 p-3 bg-white/5 rounded border border-white/10 text-sm">
                                <div className="flex justify-between text-white/80">
                                    <span>New Damage (Dealer):</span>
                                    <span className="text-green-400 font-mono font-bold">{previewStats.damage.dealer}%</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                    <span>New Resist (Proof):</span>
                                    <span className="text-blue-400 font-mono font-bold">{previewStats.resist.proof}%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Discord Contact - only show if user doesn't have Discord OAuth */}
                    {!hasDiscordOAuth && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/90 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-blue-400" />
                                Discord Username
                            </label>
                            <input
                                type="text"
                                value={discordUsername}
                                onChange={(e) => setDiscordUsername(e.target.value)}
                                placeholder="username"
                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none"
                                required={!hasDiscordOAuth}
                            />
                            <p className="text-xs text-white/50">Required for buyers to contact you.</p>
                        </div>
                    )}

                    {hasDiscordOAuth && (
                        <div className="p-3 bg-green-900/20 border border-green-500/30 rounded text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-200">Discord connected - buyers can message you directly!</span>
                        </div>
                    )}

                    <MagicalButton
                        type="submit"
                        className="w-full"
                        size="lg"
                    >
                        Confirm Listing
                    </MagicalButton>
                </form>
            </div>
        </div>
    );
}
