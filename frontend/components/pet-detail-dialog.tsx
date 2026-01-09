"use client";

import { useState, useEffect } from 'react';
import { Pet } from '@/types/firestore';
import { calculateTalentValue, calculateAllPotentials } from '@/lib/talent-formulas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Share2, EyeOff, Sparkles, Sword, Shield, Crosshair, Save, RotateCcw, Brain, Activity, Zap, Dna, Microscope } from 'lucide-react';
import { StatInputCell } from './pet/StatInputCell';
import { motion, AnimatePresence } from 'motion/react';

// Intersection type
type DisplayPet = Pet & {
    petSchool?: string; 
    petType?: string;   
    petAge?: string;
    currentStats?: Pet['stats']; 
    advice?: string;
    listedInMarketplace?: boolean;
};

type Props = {
    pet: DisplayPet | null;
    open: boolean;
    onClose: () => void;
    onListInMarketplace?: (pet: Pet) => void;
    onUnlistFromMarketplace?: (pet: Pet) => void;
    onDelete?: (pet: Pet) => void;
    onUpdate?: (petId: string, stats: Pet['stats']) => Promise<void>;
};

export function PetDetailDialog({ pet, open, onClose, onListInMarketplace, onUnlistFromMarketplace, onDelete, onUpdate }: Props) {
    const [localStats, setLocalStats] = useState<Pet['stats'] | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when pet changes or dialog opens
    useEffect(() => {
        if (pet) {
            setLocalStats(pet.stats || pet.currentStats || { strength: 0, intellect: 0, agility: 0, will: 0, power: 0 });
        }
    }, [pet, open]);

    if (!pet || !localStats) return null;

    const potentials = calculateAllPotentials(localStats);
    const originalStats = pet.stats || pet.currentStats || { strength: 0, intellect: 0, agility: 0, will: 0, power: 0 };
    
    const isDirty = JSON.stringify(localStats) !== JSON.stringify(originalStats);

    const handleStatChange = (key: keyof Pet['stats'], val: number) => {
        setLocalStats(prev => prev ? { ...prev, [key]: val } : null);
    };

    const handleSave = async () => {
        if (!onUpdate || !pet.id) return;
        try {
            setIsSaving(true);
            await onUpdate(pet.id, localStats);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setLocalStats(originalStats);
    };

    // Helper to format percentage
    const fmt = (val?: number) => val ? `${val}%` : '-';

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                if (isDirty) handleReset();
                onClose();
            }
        }}>
            {/* WIDENED TO 5XL for "Awe" & "Breathing Room" */}
            <DialogContent className="max-w-5xl bg-background/80 backdrop-blur-3xl border-white/10 p-0 overflow-hidden font-sans shadow-2xl ring-1 ring-white/10">
                
                {/* 1. Identity Header: Cinematic & Clean */}
                <div className="relative h-48 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background z-10" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 z-0 mix-blend-overlay" />
                    
                    {/* Animated "Aura" Background */}
                    <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity duration-1000" />

                    <div className="relative z-20 h-full flex flex-col justify-end p-8 pb-6">
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/10 hover:bg-white/20 text-white backdrop-blur border-none uppercase tracking-widest text-[10px] px-2 py-0.5">
                                        {pet.petSchool || 'Universal'}
                                    </Badge>
                                    <Badge variant="outline" className="border-white/20 text-white/70 uppercase tracking-widest text-[10px] px-2 py-0.5">
                                        {pet.petAge || 'Adult'}
                                    </Badge>
                                </div>
                                <h2 className="text-5xl font-black tracking-tight text-white mb-1 drop-shadow-lg">
                                    {pet.nickname || pet.petType || 'UNKNOWN'}
                                </h2>
                                <p className="text-white/60 font-medium tracking-wide text-sm flex items-center gap-2">
                                    <Dna className="w-3 h-3 text-accent-gold" />
                                    GENOME SEQUENCE: {pet.id?.slice(0, 8).toUpperCase() || 'UNKNOWN'}
                                </p>
                            </div>

                            {/* Mini-Stats on Header */}
                            <div className="hidden md:flex gap-8 text-right">
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Stats</span>
                                    <span className="text-3xl font-light text-white font-mono tracking-tighter">
                                        {Object.values(localStats).reduce((a, b) => a + b, 0)}
                                    </span>
                                </div>
                                <div className="w-px bg-white/10 h-10 my-auto" />
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Talents</span>
                                    <span className="text-3xl font-light text-white font-mono tracking-tighter">
                                        {pet.talents?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative px-8 py-8 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-background to-background/95">
                    
                    {/* 2. Laboratory Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Left: Input Analysis (Spacious) */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h4 className="text-2xl font-light text-foreground flex items-center gap-3">
                                    <Microscope className="w-6 h-6 text-primary/50" />
                                    Genetic Tuning
                                </h4>
                                {isDirty && (
                                    <div className="px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-bold tracking-wider animate-pulse flex items-center gap-2">
                                        <Activity className="w-3 h-3" />
                                        SIMULATION ACTIVE
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 shadow-inner backdrop-blur-sm">
                                <StatInputCell label="Strength" value={localStats.strength} max={255} onChange={(v) => handleStatChange('strength', v)} />
                                <StatInputCell label="Intellect" value={localStats.intellect} max={250} onChange={(v) => handleStatChange('intellect', v)} />
                                <StatInputCell label="Agility" value={localStats.agility} max={260} onChange={(v) => handleStatChange('agility', v)} />
                                <StatInputCell label="Will" value={localStats.will} max={260} onChange={(v) => handleStatChange('will', v)} />
                                <StatInputCell label="Power" value={localStats.power} max={250} onChange={(v) => handleStatChange('power', v)} />
                            </div>
                        </div>

                        {/* Right: Holographic Projections */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="border-b border-white/5 pb-4">
                                <h4 className="text-2xl font-light text-foreground flex items-center gap-3">
                                    <Zap className="w-6 h-6 text-accent-gold" />
                                    Projected Output
                                </h4>
                            </div>

                            {potentials ? (
                                <div className="space-y-4">
                                    {/* Damage: The Hero Card */}
                                    <div className="relative overflow-hidden group rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent p-5 transiton-all duration-500 hover:border-red-500/40 hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)]">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                            <Sword className="w-20 h-20 text-red-500 rotate-12" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-red-400 font-bold uppercase tracking-widest text-xs">Damage Augmentation</span>
                                                <Sword className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-foreground/60 text-sm">Dealer</span>
                                                    <span className="text-2xl font-mono font-bold text-red-50">{fmt(potentials.damage.dealer)}</span>
                                                </div>
                                                <div className="w-full h-px bg-red-500/10" />
                                                <div className="flex justify-between items-baseline text-sm">
                                                    <span className="text-foreground/40">Giver / Pain</span>
                                                    <span className="font-mono text-red-200/50">{fmt(potentials.damage.giver)}</span>
                                                </div>
                                                <div className="flex justify-between items-baseline text-sm">
                                                    <span className="text-foreground/40">Boon</span>
                                                    <span className="font-mono text-red-200/50">{fmt(potentials.damage.boon)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resist: The Shield */}
                                    <div className="relative overflow-hidden group rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-5 transiton-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                            <Shield className="w-20 h-20 text-cyan-500 -rotate-12" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Resistance Field</span>
                                                <Shield className="w-5 h-5 text-cyan-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-foreground/60 text-sm">Proof</span>
                                                    <span className="text-2xl font-mono font-bold text-cyan-50">{fmt(potentials.resist.proof)}</span>
                                                </div>
                                                <div className="w-full h-px bg-cyan-500/10" />
                                                <div className="grid grid-cols-2 gap-4">
                                                     <div className="flex justify-between items-baseline text-sm">
                                                        <span className="text-foreground/40">Defy</span>
                                                        <span className="font-mono text-cyan-200/50">{fmt(potentials.resist.defy)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline text-sm">
                                                        <span className="text-foreground/40">Ward</span>
                                                        <span className="font-mono text-cyan-200/50">{fmt(potentials.resist.ward)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pierce: The Precision */}
                                    <div className="relative overflow-hidden group rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent p-4 flex items-center justify-between transiton-all duration-500 hover:border-yellow-500/40 hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.2)]">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                                                <Crosshair className="w-6 h-6 text-yellow-500" />
                                            </div>
                                            <div>
                                                <span className="text-yellow-500 font-bold uppercase tracking-widest text-[10px] block mb-0.5">Penetration</span>
                                                <span className="text-foreground font-medium text-sm">Armor Breaker</span>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-mono font-bold text-yellow-50 pr-2">{fmt(potentials.pierce.breaker)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-8 border border-white/5 rounded-2xl border-dashed text-center">
                                    <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-muted-foreground/50 text-sm">Adjust genetic parameters to calculate potential.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Gamma's Insight (Glass Note) */}
                    {pet.advice && (
                        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:bg-white/[0.05]">
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-500 opacity-50" />
                            <div className="flex gap-5">
                                <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-inner">
                                    <Brain className="h-5 w-5 text-blue-300" />
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold uppercase tracking-widest text-blue-300/80">Cognitive Analysis</h5>
                                    <p className="text-base text-foreground/90 leading-relaxed font-light">
                                        {pet.advice}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions (Floating Glass Bar) */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            {onDelete && (
                                <Button 
                                    variant="ghost" 
                                    className="text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10 text-xs uppercase tracking-widest h-10 px-4 rounded-full transition-all"
                                    onClick={() => {
                                        if(confirm("Release this pet? This action cannot be undone.")) onDelete(pet);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Release Subject
                                </Button>
                            )}
                        </div>
                        
                        <div className="flex gap-4">
                            <Button 
                                variant="secondary" 
                                className="bg-white/5 hover:bg-white/10 text-foreground border border-white/5 rounded-full px-6 transition-all hover:scale-105"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/marketplace/${pet.id}`);
                                    alert("Link copied!");
                                }}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>

                            {pet.listedInMarketplace ? (
                                onUnlistFromMarketplace && (
                                    <Button 
                                        variant="outline" 
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-full px-6"
                                        onClick={() => onUnlistFromMarketplace(pet)}
                                    >
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Unlist
                                    </Button>
                                )
                            ) : (
                                onListInMarketplace && (
                                    <Button 
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 rounded-full px-8 transition-all hover:scale-105 hover:shadow-primary/40"
                                        onClick={() => onListInMarketplace(pet)}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Broadcast to Kiosk
                                    </Button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Floating Save Bar (Minimal) */}
                    <AnimatePresence>
                        {isDirty && (
                            <motion.div 
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="sticky bottom-0 z-50 flex justify-center w-full pointer-events-none pb-2"
                            >
                                <div className="pointer-events-auto flex items-center p-1.5 pl-4 pr-1.5 bg-foreground text-background rounded-full shadow-2xl border border-white/20 backdrop-blur-md">
                                    <span className="text-xs font-bold mr-4">Unsaved Changes</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-black/10" onClick={handleReset} disabled={isSaving}>
                                            <RotateCcw className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" className="h-8 rounded-full bg-accent-gold text-black hover:bg-accent-gold/90 font-bold px-4" onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? "Saving..." : "Commit"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
