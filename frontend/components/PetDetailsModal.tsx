'use client';

import React from 'react';
import { X, Shield, Sword, Sparkles, Share2 } from 'lucide-react';
import { clsx } from 'clsx';

type PetDetailsModalProps = {
    pet: any;
    onClose: () => void;
    onListInMarketplace?: (pet: any) => void;
};

export function PetDetailsModal({ pet, onClose, onListInMarketplace }: PetDetailsModalProps) {
    if (!pet) return null;

    // Calculate stats for display (reusing logic from Calculator roughly)
    const calculateStats = (stats: any) => {
        if (!stats) return { damage: 0, resist: 0 };
        const baseDmg = (2 * stats.strength + 2 * stats.will + stats.power);
        const baseRes = (2 * stats.strength + 2 * stats.agility + stats.power);
        return {
            damage: Math.round(baseDmg * (3 / 400)), // Dealer equivalent
            resist: Math.round(baseRes / 125) // Proof equivalent
        };
    };

    const potential = calculateStats(pet.currentStats);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a2e] border-2 border-accent-gold rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="p-6 border-b border-accent-gold/20 bg-gradient-to-r from-accent-blue/10 to-transparent">
                    <h2 className="text-3xl font-serif font-bold text-accent-gold mb-1">
                        {pet.petNickname || pet.petType}
                    </h2>
                    <div className="flex gap-3 text-sm text-white/70">
                        <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{pet.petSchool}</span>
                        <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{pet.petAge}</span>
                        <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{pet.petType}</span>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Stats */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-serif font-bold text-white/90 border-b border-white/10 pb-1">Base Stats</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {pet.currentStats && Object.entries(pet.currentStats).map(([key, val]: [string, any]) => (
                                    <div key={key} className="flex justify-between p-2 bg-white/5 rounded">
                                        <span className="capitalize text-white/60">{key}</span>
                                        <span className="font-mono text-accent-gold">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Potential */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-serif font-bold text-white/90 border-b border-white/10 pb-1">Potential</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-300">
                                        <Sword className="w-4 h-4" />
                                        <span>Dealer Damage</span>
                                    </div>
                                    <span className="text-xl font-bold text-red-100">{potential.damage}%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-300">
                                        <Shield className="w-4 h-4" />
                                        <span>Spell Proof</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-100">{potential.resist}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Talents */}
                    {pet.talents && pet.talents.length > 0 && (
                        <div>
                            <h3 className="text-lg font-serif font-bold text-white/90 mb-3">Manifested Talents</h3>
                            <div className="flex flex-wrap gap-2">
                                {pet.talents.map((talent: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold rounded-full text-sm">
                                        {talent}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gemini Advice (if saved) */}
                    {/* Note: We didn't explicitly save 'advice' in the savePet action earlier, 
                        so it might be missing from older saves. But let's check if we can add it or if it's there. 
                        Wait, I checked savePet in actions.ts and it DOES NOT save advice. 
                        I need to update savePet to save advice too! */}

                    {/* Marketplace Action */}
                    {!pet.listedInMarketplace && onListInMarketplace && (
                        <div className="pt-6 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => onListInMarketplace(pet)}
                                className="flex items-center gap-2 px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                List in Kiosk
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
