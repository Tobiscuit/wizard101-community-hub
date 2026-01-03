'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Shield, Sword, Sparkles, ChevronUp, ChevronDown, Save, Loader2, Crosshair, CircleDashed } from 'lucide-react';

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
import { savePet } from '@/app/actions';
import { calculateAllPotentials } from '@/lib/talent-formulas';

// UI Components
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { MagicCard } from "@/components/magicui/magic-card"

export function Calculator() {
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    // State
    const [currentStats, setCurrentStats] = useState<Record<keyof Stats, number | string>>({ ...BASE_CAPS });
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

    // Handlers
    const handleStatChange = (stat: keyof Stats, value: string) => {
        if (value === '') {
            setCurrentStats(prev => ({ ...prev, [stat]: '' }));
            return;
        }
        const num = parseInt(value);
        if (!isNaN(num)) {
            setCurrentStats(prev => ({ ...prev, [stat]: num }));
        }
    };

    const handleBlur = (stat: keyof Stats) => {
        if (currentStats[stat] === '') {
            setCurrentStats(prev => ({ ...prev, [stat]: 0 }));
        }
    };

    // Helper to get safe numbers for calculations
    const getSafeStats = (): Stats => {
        return {
            strength: Number(currentStats.strength) || 0,
            intellect: Number(currentStats.intellect) || 0,
            agility: Number(currentStats.agility) || 0,
            will: Number(currentStats.will) || 0,
            power: Number(currentStats.power) || 0,
        };
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
                currentStats: getSafeStats(),
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

    const potentials = calculateAllPotentials(getSafeStats());

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <PetScanner onScanComplete={handleScanComplete} />

            {petInfo.type && (
                <div className="text-center mb-6 p-4 bg-background/50 backdrop-blur-sm rounded-xl border relative group shadow-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPetInfo({})}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        title="Clear and Rescan"
                    >
                        <span className="sr-only">Clear</span>
                        ✕
                    </Button>

                    <h3 className="text-2xl font-serif font-bold text-accent-gold drop-shadow-sm">
                        {petInfo.name && <span className="text-foreground mr-2">&quot;{petInfo.name}&quot;</span>}
                        {petInfo.type}
                    </h3>
                    <div className="flex justify-center gap-3 mt-2 text-sm">
                        {petInfo.school && <span className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{petInfo.school}</span>}
                        {petInfo.age && <span className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{petInfo.age}</span>}
                    </div>

                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                                setPetInfo(prev => ({ ...prev, type: undefined }));
                            }}
                            className="text-muted-foreground hover:text-accent-gold"
                        >
                            Not the right pet? Try again
                        </Button>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">
                        Pet Stats
                    </h2>
                    
                    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border shadow-sm space-y-4">
                        {(Object.keys(BASE_CAPS) as Array<keyof Stats>).map((stat) => (
                            <div key={stat} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={stat} className="col-span-1 capitalize font-serif text-base text-foreground/80">
                                    {stat}
                                </Label>
                                <div className="col-span-3 relative">
                                    <Input
                                        id={stat}
                                        type="number"
                                        value={currentStats[stat]}
                                        onChange={(e) => handleStatChange(stat, e.target.value)}
                                        onBlur={() => handleBlur(stat)}
                                        className="font-mono text-lg bg-background/50 focus-visible:ring-accent-gold"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                        / {maxStats[stat]}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">
                        Calculated Potential
                    </h2>

                    <div className="grid gap-4">
                        {/* Damage Card */}
                        <MagicCard 
                            className="p-6 border-accent-gold/20"
                            gradientColor="var(--school-fire)"
                            gradientOpacity={0.15}
                        >
                            <div className="flex items-center gap-2 mb-4 text-school-fire">
                                <Sword className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Damage</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Dealer</span>
                                    <span className="font-bold text-lg font-mono">{potentials.damage.dealer}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Giver</span>
                                    <span className="font-bold text-lg font-mono">{potentials.damage.giver}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Boon</span>
                                    <span className="font-bold text-lg font-mono">{potentials.damage.boon}%</span>
                                </div>
                            </div>
                        </MagicCard>

                        {/* Resist Card */}
                        <MagicCard 
                            className="p-6 border-accent-gold/20"
                            gradientColor="var(--school-ice)"
                            gradientOpacity={0.15}
                        >
                            <div className="flex items-center gap-2 mb-4 text-school-ice">
                                <Shield className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Resistance</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Spell-Proof</span>
                                    <span className="font-bold text-lg font-mono">{potentials.resist.proof}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Spell-Defying</span>
                                    <span className="font-bold text-lg font-mono">{potentials.resist.defy}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">School Ward</span>
                                    <span className="font-bold text-lg font-mono">{potentials.resist.ward}%</span>
                                </div>
                            </div>
                        </MagicCard>

                        {/* Pierce Card */}
                        <MagicCard 
                            className="p-6 border-accent-gold/20"
                            gradientColor="#EAB308" // Yellow-500
                            gradientOpacity={0.15}
                        >
                            <div className="flex items-center gap-2 mb-4 text-yellow-500">
                                <Sword className="w-6 h-6 rotate-45" />
                                <h3 className="text-xl font-bold">Pierce</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Armor Breaker</span>
                                    <span className="font-bold text-lg font-mono">{potentials.pierce.breaker}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Armor Piercer</span>
                                    <span className="font-bold text-lg font-mono">{potentials.pierce.piercer}%</span>
                                </div>
                            </div>
                        </MagicCard>

                        {/* Accuracy Card */}
                        <MagicCard 
                            className="p-6 border-accent-gold/20"
                            gradientColor="var(--school-storm)" // Purple/Storm logic for accuracy? Or Balance? Storm = Accuracy issues.
                            gradientOpacity={0.15}
                        >
                            <div className="flex items-center gap-2 mb-4 text-purple-500">
                                <Crosshair className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Accuracy</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Sniper</span>
                                    <span className="font-bold text-lg font-mono">{potentials.accuracy.sniper}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Sharp-Shot</span>
                                    <span className="font-bold text-lg font-mono">{potentials.accuracy.sharp}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Shot</span>
                                    <span className="font-bold text-lg font-mono">{potentials.accuracy.shot}%</span>
                                </div>
                            </div>
                        </MagicCard>

                        {/* Pips Card */}
                        <MagicCard 
                            className="p-6 border-accent-gold/20"
                            gradientColor="var(--school-balance)" // Balance = Pips
                            gradientOpacity={0.15}
                        >
                            <div className="flex items-center gap-2 mb-4 text-amber-600">
                                <CircleDashed className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Pip Chance</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-background/40 p-2 rounded">
                                    <span className="text-sm font-medium">Pip O&apos;Plenty</span>
                                    <span className="font-bold text-lg font-mono">{potentials.pips.plenty}%</span>
                                </div>
                            </div>
                        </MagicCard>
                    </div>
                </div >
            </div >

            {/* Talents & Advice */}
            {
                (talents.length > 0 || advice) && (
                    <div className="space-y-4 pt-4 border-t">
                        {talents.length > 0 && (
                            <div>
                                <h3 className="text-lg font-serif font-bold text-accent-gold mb-2">Manifested Talents</h3>
                                <div className="flex flex-wrap gap-2">
                                    {talents.map((talent, i) => (
                                        <span key={i} className="px-4 py-1.5 bg-background shadow-sm border border-accent-gold/20 rounded-full text-sm font-medium capitalize animate-in zoom-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                            {talent}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {advice && (
                            <MagicCard 
                                className="p-6 bg-muted/50"
                                gradientColor="var(--accent-blue)"
                                gradientOpacity={0.1}
                            >
                                <h3 className="text-lg font-serif font-bold text-accent-blue mb-2 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Gamma&apos;s Wisdom
                                </h3>
                                <p className="text-base text-foreground/80 leading-relaxed italic">
                                    &quot;{advice}&quot;
                                </p>
                            </MagicCard>
                        )}
                    </div>
                )
            }

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 items-center pt-8 pb-12">
                <ShinyButton
                    onClick={handleSavePet}
                    disabled={isSaving}
                    className="min-w-[220px] shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg font-serif font-bold tracking-widest"
                >
                    <div className="flex items-center gap-2">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {session ? "Save to My Pets" : "Login to Save"}
                    </div>
                </ShinyButton>
            </div>
        </div >
    );
}
