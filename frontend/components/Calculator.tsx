'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Sparkles, Shield, Sword } from 'lucide-react';

// Types
type Stats = {
    strength: number;
    intellect: number;
    agility: number;
    will: number;
    power: number;
};

const BASE_CAPS: Stats = {
    strength: 255,
    intellect: 250,
    agility: 260,
    will: 260,
    power: 250,
};

export function Calculator() {
    // State
    const [currentStats, setCurrentStats] = useState<Stats>({ ...BASE_CAPS });
    const [maxStats, setMaxStats] = useState<Stats>({ ...BASE_CAPS });
    const [talents, setTalents] = useState<string[]>([]);

    // Calculation Formulas
    const calculateDamage = () => {
        // Formula: (2*Strength + 2*Will + Power) * Multiplier
        const base = (2 * currentStats.strength + 2 * currentStats.will + currentStats.power);

        // Example multipliers (simplified for MVP)
        // Dealer = 3/400 (0.0075) -> ~10% at max
        // Giver = 1/200 (0.005) -> ~6% at max
        // Boon = 1/400 (0.0025) -> ~3% at max

        // For MVP display, let's show what a "Dealer" talent would give
        const dealer = Math.round(base * (3 / 400));
        const giver = Math.round(base * (1 / 200));
        const boon = Math.round(base * (1 / 400));

        return { dealer, giver, boon };
    };

    const calculateResist = () => {
        // Formula: (2*Strength + 2*Agility + Power) / Divisor
        const base = (2 * currentStats.strength + 2 * currentStats.agility + currentStats.power);

        // Proof = /125 -> ~10% at max
        // Defy = /250 -> ~5% at max

        const proof = Math.round(base / 125);
        const defy = Math.round(base / 250);

        return { proof, defy };
    };

    const damage = calculateDamage();
    const resist = calculateResist();

    // Handlers
    const handleStatChange = (stat: keyof Stats, value: string) => {
        const num = parseInt(value) || 0;
        setCurrentStats(prev => ({ ...prev, [stat]: num }));
    };

    return (
        <div className="space-y-8">
            {/* Stats Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-2xl font-serif text-accent-gold border-b border-accent-gold/30 pb-2">
                        Pet Stats
                    </h2>

                    {(Object.keys(BASE_CAPS) as Array<keyof Stats>).map((stat) => (
                        <div key={stat} className="flex items-center gap-4">
                            <label className="w-24 capitalize font-serif text-lg">{stat}</label>
                            <div className="flex-1 relative">
                                <input
                                    type="number"
                                    value={currentStats[stat]}
                                    onChange={(e) => handleStatChange(stat, e.target.value)}
                                    className={clsx(
                                        "w-full bg-[#F5E6C4] border-b-2 border-[#8B4513]/50",
                                        "px-2 py-1 text-xl font-mono text-[#2C1A0B]",
                                        "focus:outline-none focus:border-accent-blue focus:bg-white/50",
                                        "transition-colors duration-200"
                                    )}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                                    / {maxStats[stat]}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-serif text-accent-gold border-b border-accent-gold/30 pb-2">
                        Calculated Potential
                    </h2>

                    {/* Damage Card */}
                    <div className="bg-black/10 p-4 rounded-lg border border-accent-gold/20">
                        <div className="flex items-center gap-2 mb-3 text-school-fire">
                            <Sword className="w-6 h-6" />
                            <h3 className="text-xl font-bold">Damage</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Dealer (10%):</span>
                                <span className="font-bold text-xl">{damage.dealer}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Giver (6%):</span>
                                <span className="font-bold text-xl">{damage.giver}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Boon (3%):</span>
                                <span className="font-bold text-xl">{damage.boon}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Resist Card */}
                    <div className="bg-black/10 p-4 rounded-lg border border-accent-gold/20">
                        <div className="flex items-center gap-2 mb-3 text-school-ice">
                            <Shield className="w-6 h-6" />
                            <h3 className="text-xl font-bold">Resistance</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Spell-Proof (10%):</span>
                                <span className="font-bold text-xl">{resist.proof}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Spell-Defying (5%):</span>
                                <span className="font-bold text-xl">{resist.defy}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-8">
                <button className={clsx(
                    "group relative px-8 py-3 bg-accent-blue text-white font-serif text-xl rounded-lg",
                    "shadow-lg hover:shadow-accent-blue/50 transition-all duration-300",
                    "hover:scale-105 active:scale-95"
                )}>
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Analyze with Gemini
                    </span>
                    <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
}
