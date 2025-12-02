'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Shield, Sword, Sparkles } from 'lucide-react';

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

import { PetScanner } from './PetScanner';

import { useSession, signIn } from 'next-auth/react';
import { Save, Loader2 } from 'lucide-react';
import { savePet } from '@/app/actions';

export function Calculator() {
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    // State
    const [currentStats, setCurrentStats] = useState<Stats>({ ...BASE_CAPS });
    const [maxStats, setMaxStats] = useState<Stats>({ ...BASE_CAPS });
    const [talents, setTalents] = useState<string[]>([]);
    const [advice, setAdvice] = useState<string>("");
    const [petInfo, setPetInfo] = useState<{ name?: string; type?: string; school?: string; age?: string }>({});
    const [confidence, setConfidence] = useState<number>(100);

    // Load from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('pet_draft');
        if (savedDraft) {
            try {
                const data = JSON.parse(savedDraft);
                if (data.currentStats) setCurrentStats(data.currentStats);
                if (data.maxPossibleStats) setMaxStats(data.maxPossibleStats);
                if (data.talents) setTalents(data.talents);
                if (data.advice) setAdvice(data.advice);
                if (data.petInfo) setPetInfo(data.petInfo);
                // Optional: Clear draft after loading? 
                // Better to keep it until successfully saved to DB to prevent loss.
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, []);

    // Save to localStorage whenever important state changes
    useEffect(() => {
        const draft = {
            currentStats,
            maxPossibleStats: maxStats,
            talents,
            advice,
            petInfo
        };
        localStorage.setItem('pet_draft', JSON.stringify(draft));
    }, [currentStats, maxStats, talents, advice, petInfo]);

    const handleScanComplete = (data: any) => {
        if (data.currentStats) setCurrentStats(data.currentStats);
        if (data.maxPossibleStats) setMaxStats(data.maxPossibleStats);
        if (data.talents) setTalents(data.talents);
        if (data.advice) setAdvice(data.advice);
        if (data.confidence) setConfidence(data.confidence);

        setPetInfo({
            name: data.petNickname,
            type: data.petType,
            school: data.petSchool,
            age: data.petAge
        });
    };

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

    const handleSavePet = async () => {
        if (!session?.user?.id) {
            signIn(); // Redirect to login if not authenticated
            return;
        }

        setIsSaving(true);
        try {
            // Call Server Action
            const result = await savePet({
                petNickname: petInfo.name,
                petType: petInfo.type,
                petSchool: petInfo.school,
                petAge: petInfo.age,
                currentStats,
                maxPossibleStats: maxStats,
                currentStats,
                maxPossibleStats: maxStats,
                talents,
                advice
            });

            if (result.success) {
                alert("Pet saved to your tome!");
                localStorage.removeItem('pet_draft');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error saving pet:", error);
            alert("Failed to save pet. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <PetScanner onScanComplete={handleScanComplete} />

            {petInfo.type && (
                <div className="text-center mb-6 p-4 bg-white/30 rounded-lg border border-accent-gold/30 relative group">
                    <button
                        onClick={() => setPetInfo({})}
                        className="absolute top-2 right-2 p-1 text-foreground/40 hover:text-foreground hover:bg-white/50 rounded transition-all"
                        title="Clear and Rescan"
                    >
                        <span className="sr-only">Clear</span>
                        ✕
                    </button>

                    <h3 className="text-xl font-serif font-bold text-accent-gold">
                        {petInfo.name && <span className="text-foreground mr-2">"{petInfo.name}"</span>}
                        {petInfo.type}
                    </h3>
                    <div className="flex justify-center gap-3 mt-2 text-sm">
                        {petInfo.school && <span className="px-2 py-0.5 bg-black/10 rounded">{petInfo.school}</span>}
                        {petInfo.age && <span className="px-2 py-0.5 bg-black/10 rounded">{petInfo.age}</span>}
                    </div>

                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => {
                                // Unlock by clearing specific fields but keeping stats? 
                                // For now, let's just allow them to clear and retry, or we can make inputs editable.
                                // Actually, let's just show the inputs but pre-filled, and remove this "locked" display if they want to edit.
                                setPetInfo(prev => ({ ...prev, type: undefined }));
                            }}
                            className="text-xs text-accent-blue hover:underline"
                        >
                            Incorrect? Edit Details
                        </button>
                    </div>
                </div>
            )}

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

            {/* Talents & Advice */}
            {(talents.length > 0 || advice) && (
                <div className="space-y-4 pt-4 border-t border-accent-gold/30">
                    {talents.length > 0 && (
                        <div>
                            <h3 className="text-lg font-serif font-bold text-accent-gold mb-2">Manifested Talents</h3>
                            <div className="flex flex-wrap gap-2">
                                {talents.map((talent, i) => (
                                    <span key={i} className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-sm">
                                        {talent}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {advice && (
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                            <h3 className="text-lg font-serif font-bold text-blue-300 mb-1 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Gemini's Insight
                            </h3>
                            <p className="text-sm text-blue-100/90 italic">
                                "{advice}"
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 items-center pt-8">


                <button
                    onClick={handleSavePet}
                    disabled={isSaving}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-2 rounded-lg font-serif text-lg",
                        "bg-green-600 text-white shadow-md",
                        "hover:bg-green-500 transition-all",
                        "disabled:opacity-50"
                    )}
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {session ? "Save to My Pets" : "Login to Save"}
                </button>
            </div>
        </div>
    );
}
