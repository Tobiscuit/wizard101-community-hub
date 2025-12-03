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

    import { calculateAllPotentials } from '@/lib/talent-formulas';

    // ... inside component ...
    const potentials = calculateAllPotentials(currentStats);

    return (
        // ...
        {/* Results Section */ }
        < div className = "space-y-6" >
            <h2 className="text-2xl font-serif text-accent-gold border-b border-accent-gold/30 pb-2">
                Calculated Potential
            </h2>

    {/* Damage Card */ }
    <div className="bg-black/10 p-4 rounded-lg border border-accent-gold/20">
        <div className="flex items-center gap-2 mb-3 text-school-fire">
            <Sword className="w-6 h-6" />
            <h3 className="text-xl font-bold">Damage</h3>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between">
                <span>Dealer:</span>
                <span className="font-bold text-xl">{potentials.damage.dealer}%</span>
            </div>
            <div className="flex justify-between">
                <span>Giver:</span>
                <span className="font-bold text-xl">{potentials.damage.giver}%</span>
            </div>
            <div className="flex justify-between">
                <span>Boon:</span>
                <span className="font-bold text-xl">{potentials.damage.boon}%</span>
            </div>
        </div>
    </div>

    {/* Resist Card */ }
    <div className="bg-black/10 p-4 rounded-lg border border-accent-gold/20">
        <div className="flex items-center gap-2 mb-3 text-school-ice">
            <Shield className="w-6 h-6" />
            <h3 className="text-xl font-bold">Resistance</h3>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between">
                <span>Spell-Proof:</span>
                <span className="font-bold text-xl">{potentials.resist.proof}%</span>
            </div>
            <div className="flex justify-between">
                <span>Spell-Defying:</span>
                <span className="font-bold text-xl">{potentials.resist.defy}%</span>
            </div>
            <div className="flex justify-between">
                <span>School Ward:</span>
                <span className="font-bold text-xl">{potentials.resist.ward}%</span>
            </div>
        </div>
    </div>

    {/* Pierce Card */ }
    <div className="bg-black/10 p-4 rounded-lg border border-accent-gold/20">
        <div className="flex items-center gap-2 mb-3 text-yellow-500">
            <Sword className="w-6 h-6 rotate-45" />
            <h3 className="text-xl font-bold">Pierce</h3>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between">
                <span>Armor Breaker:</span>
                <span className="font-bold text-xl">{potentials.pierce.breaker}%</span>
            </div>
            <div className="flex justify-between">
                <span>Armor Piercer:</span>
                <span className="font-bold text-xl">{potentials.pierce.piercer}%</span>
            </div>
        </div>
    </div>
                </div >
            </div >

        {/* Talents & Advice */ }
    {
        (talents.length > 0 || advice) && (
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
        )
    }

    {/* Action Buttons */ }
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
        </div >
    );
}
