'use client';

import React from 'react';
import { X, Shield, Sword, Sparkles, Share2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { calculateTalentValue, calculateAllPotentials } from '@/lib/talent-formulas';

type PetDetailsModalProps = {
    pet: any;
    onClose: () => void;
    onListInMarketplace?: (pet: any) => void;
    onUnlistFromMarketplace?: (pet: any) => void;
};

export function PetDetailsModal({ pet, onClose, onListInMarketplace, onUnlistFromMarketplace }: PetDetailsModalProps) {
    if (!pet) return null;

    const potentials = pet.currentStats ? calculateAllPotentials(pet.currentStats) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a2e] border-2 border-accent-gold rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">

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
                            <h3 className="text-lg font-serif font-bold text-white/90 border-b border-white/10 pb-1">Max Potential</h3>
                            {potentials && (
                                <div className="space-y-2 text-sm">
                                    {/* Damage Row */}
                                    <div className="flex items-center justify-between p-2 bg-red-900/20 border border-red-500/20 rounded">
                                        <div className="flex items-center gap-2 text-red-300">
                                            <Sword className="w-4 h-4" />
                                            <span>Damage</span>
                                        </div>
                                        <div className="flex gap-3 text-red-100 font-mono">
                                            <span title="Dealer">Dlr:{potentials.damage.dealer}%</span>
                                            <span title="Giver">Gvr:{potentials.damage.giver}%</span>
                                            <span title="Boon">Bn:{potentials.damage.boon}%</span>
                                        </div>
                                    </div>

                                    {/* Resist Row */}
                                    <div className="flex items-center justify-between p-2 bg-blue-900/20 border border-blue-500/20 rounded">
                                        <div className="flex items-center gap-2 text-blue-300">
                                            <Shield className="w-4 h-4" />
                                            <span>Resist</span>
                                        </div>
                                        <div className="flex gap-3 text-blue-100 font-mono">
                                            <span title="Spell-Proof">Prf:{potentials.resist.proof}%</span>
                                            <span title="Spell-Defying">Dfy:{potentials.resist.defy}%</span>
                                            <span title="School Ward">Wrd:{potentials.resist.ward}%</span>
                                        </div>
                                    </div>

                                    {/* Pierce Row */}
                                    <div className="flex items-center justify-between p-2 bg-yellow-900/20 border border-yellow-500/20 rounded">
                                        <div className="flex items-center gap-2 text-yellow-300">
                                            <Sword className="w-4 h-4 rotate-45" />
                                            <span>Pierce</span>
                                        </div>
                                        <div className="flex gap-3 text-yellow-100 font-mono">
                                            <span title="Armor Breaker">Brk:{potentials.pierce.breaker}%</span>
                                            <span title="Armor Piercer">Prc:{potentials.pierce.piercer}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Talents */}
                    {pet.talents && pet.talents.length > 0 && (
                        <div>
                            <h3 className="text-lg font-serif font-bold text-white/90 mb-3">Manifested Talents</h3>
                            <div className="flex flex-wrap gap-2">
                                {pet.talents.map((talent: string, i: number) => {
                                    const val = calculateTalentValue(talent, pet.currentStats);
                                    return (
                                        <span key={i} className="px-3 py-1 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold rounded-full text-sm flex items-center gap-2">
                                            {talent}
                                            {val && <span className="text-white/70 font-mono text-xs">({val})</span>}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Gemini Advice (if saved) */}
                    {pet.advice && (
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                            <h3 className="text-lg font-serif font-bold text-blue-300 mb-1 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Gemini's Insight
                            </h3>
                            <p className="text-sm text-blue-100/90 italic">
                                "{pet.advice}"
                            </p>
                        </div>
                    )}

                    {/* Marketplace Action */}
                    <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                        {!pet.listedInMarketplace && onListInMarketplace && (
                            <button
                                onClick={() => onListInMarketplace(pet)}
                                className="flex items-center gap-2 px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                List in Kiosk
                            </button>
                        )}

                        {pet.listedInMarketplace && onUnlistFromMarketplace && (
                            <button
                                onClick={() => onUnlistFromMarketplace(pet)}
                                className="flex items-center gap-2 px-6 py-2 bg-red-900/50 text-red-200 border border-red-500/30 rounded-lg hover:bg-red-900/80 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Unlist from Kiosk
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
