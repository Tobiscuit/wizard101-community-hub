"use client";

import { useState, useEffect } from 'react';
import { Pet } from '@/types/firestore';
import { calculateTalentValue, calculateAllPotentials } from '@/lib/talent-formulas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    Trash2, Share2, EyeOff, Sparkles, Sword, Shield, Crosshair, 
    Save, RotateCcw, Brain, Activity, Zap, Dna, Target, CircleDot 
} from 'lucide-react';
import { StatInputCell } from './pet/StatInputCell';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

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
            {/* MASSIVE WIDTH INCREASE: max-w-7xl to eliminate scrolling by trading vertical for horizontal */}
            <DialogContent 
                className="w-full max-w-7xl bg-background border-border p-0 flex flex-col shadow-2xl overflow-hidden max-h-[95vh]"
                aria-describedby={undefined}
            >
                
                {/* 1. Identity Header: Fixed Top */}
                <div className="shrink-0 relative h-36 overflow-hidden group border-b border-border bg-muted/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/40 to-background z-10" />
                    
                    <div className="relative z-20 h-full flex flex-col justify-end p-8 pb-5">
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none uppercase tracking-widest text-[10px] px-2 py-0.5 font-bold">
                                        {pet.petSchool || 'Universal'}
                                    </Badge>
                                    <Badge variant="outline" className="border-border text-muted-foreground uppercase tracking-widest text-[10px] px-2 py-0.5">
                                        {pet.petAge || 'Adult'}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-1 drop-shadow-sm line-clamp-1">
                                    {pet.nickname || pet.petType || 'UNKNOWN'}
                                </DialogTitle>
                                <p className="text-muted-foreground font-medium tracking-wide text-sm flex items-center gap-2">
                                    {pet.petType || 'Standard Pet'}
                                </p>
                            </div>

                            {/* Mini-Stats on Header */}
                            <div className="hidden md:flex gap-8 text-right shrink-0">
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Total Stats</span>
                                    <span className="text-2xl font-light text-foreground font-mono tracking-tighter">
                                        {Object.values(localStats).reduce((a, b) => a + b, 0)}
                                    </span>
                                </div>
                                <div className="w-px bg-border h-10 my-auto" />
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Talents</span>
                                    <span className="text-2xl font-light text-foreground font-mono tracking-tighter">
                                        {pet.talents?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body: Scrollable if necessary, but layout optimized to avoid it */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
                    <div className="px-8 py-8 space-y-8">
                    
                        {/* 2. Laboratory Layout: Grid Split with Optimized Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            
                            {/* Left: Base Stats (Takes up 4 cols now, allowing more room for right side) */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <h4 className="text-xl font-light text-foreground flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-primary/70" />
                                        Base Stats
                                    </h4>
                                    {isDirty && (
                                        <Badge variant="outline" className="text-accent-gold border-accent-gold/40 bg-accent-gold/5 text-[10px] animate-pulse">
                                            PREVIEWING
                                        </Badge>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 p-5 rounded-2xl bg-muted/30 border border-border shadow-sm">
                                    <StatInputCell label="Strength" value={localStats.strength} max={255} onChange={(v) => handleStatChange('strength', v)} />
                                    <StatInputCell label="Intellect" value={localStats.intellect} max={250} onChange={(v) => handleStatChange('intellect', v)} />
                                    <StatInputCell label="Agility" value={localStats.agility} max={260} onChange={(v) => handleStatChange('agility', v)} />
                                    <StatInputCell label="Will" value={localStats.will} max={260} onChange={(v) => handleStatChange('will', v)} />
                                    <StatInputCell label="Power" value={localStats.power} max={250} onChange={(v) => handleStatChange('power', v)} />
                                </div>
                            </div>

                            {/* Right: Max Potential (Takes up 7 cols - GRID DISPLAY) */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="border-b border-border pb-3">
                                    <h4 className="text-xl font-light text-foreground flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-accent-gold" />
                                        Max Potential
                                    </h4>
                                </div>

                                {potentials ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Damage */}
                                        <div className="relative overflow-hidden group rounded-xl border border-red-500/10 bg-gradient-to-br from-red-500/5 to-transparent p-4 transition-all duration-300 hover:border-red-500/30">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Sword className="w-12 h-12 text-red-500 rotate-12" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-red-400 font-bold uppercase tracking-widest text-[10px]">Damage</span>
                                                    <Sword className="w-4 h-4 text-red-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-foreground/70 text-sm">Dealer</span>
                                                        <span className="text-xl font-mono font-bold text-red-100">{fmt(potentials.damage.dealer)}</span>
                                                    </div>
                                                    <div className="w-full h-px bg-red-500/10 my-1" />
                                                    <div className="flex justify-between items-baseline text-xs">
                                                        <span className="text-muted-foreground">Giver</span>
                                                        <span className="font-mono text-red-200/60">{fmt(potentials.damage.giver)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline text-xs">
                                                        <span className="text-muted-foreground">Boon</span>
                                                        <span className="font-mono text-red-200/60">{fmt(potentials.damage.boon)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resist */}
                                        <div className="relative overflow-hidden group rounded-xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 to-transparent p-4 transition-all duration-300 hover:border-cyan-500/30">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Shield className="w-12 h-12 text-cyan-500 -rotate-12" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Resist</span>
                                                    <Shield className="w-4 h-4 text-cyan-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-foreground/70 text-sm">Proof</span>
                                                        <span className="text-xl font-mono font-bold text-cyan-100">{fmt(potentials.resist.proof)}</span>
                                                    </div>
                                                    <div className="w-full h-px bg-cyan-500/10 my-1" />
                                                    <div className="grid grid-cols-2 gap-2">
                                                         <div className="flex justify-between items-baseline text-xs">
                                                            <span className="text-muted-foreground">Defy</span>
                                                            <span className="font-mono text-cyan-200/60">{fmt(potentials.resist.defy)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-baseline text-xs">
                                                            <span className="text-muted-foreground">Ward</span>
                                                            <span className="font-mono text-cyan-200/60">{fmt(potentials.resist.ward)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pierce Extended */}
                                        <div className="relative overflow-hidden group rounded-xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/5 to-transparent p-4 transition-all duration-300 hover:border-yellow-500/30">
                                            <div className="flex justify-between items-start mb-2 relative z-10">
                                                <span className="text-yellow-500 font-bold uppercase tracking-widest text-[10px]">Pierce</span>
                                                <Crosshair className="w-4 h-4 text-yellow-500" />
                                            </div>
                                            <div className="space-y-1 relative z-10">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-foreground/70 text-sm">Breaker</span>
                                                    <span className="text-xl font-mono font-bold text-yellow-100">{fmt(potentials.pierce.breaker)}</span>
                                                </div>
                                                <div className="w-full h-px bg-yellow-500/10 my-1" />
                                                <div className="flex justify-between items-baseline text-xs">
                                                    <span className="text-muted-foreground">Piercer</span>
                                                    <span className="font-mono text-yellow-200/60">{fmt(potentials.pierce.piercer)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Universal Utility (Accuracy + Pips) */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Accuracy */}
                                            <div className="relative overflow-hidden group rounded-xl border border-purple-500/10 bg-gradient-to-br from-purple-500/5 to-transparent p-3 transition-all duration-300 hover:border-purple-500/30 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-purple-400 font-bold uppercase tracking-widest text-[9px]">Accuracy</span>
                                                    <Target className="w-3 h-3 text-purple-400" />
                                                </div>
                                                <div className="space-y-1 mt-2">
                                                     <div className="flex justify-between items-baseline text-xs">
                                                        <span className="text-foreground/70 text-[10px]">Sharp</span>
                                                        <span className="font-mono font-bold text-purple-100 text-sm">{fmt(potentials.accuracy.sharp)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline text-xs">
                                                        <span className="text-muted-foreground text-[10px]">Sniper</span>
                                                        <span className="font-mono text-purple-200/60 text-[10px]">{fmt(potentials.accuracy.sniper)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pips */}
                                            <div className="relative overflow-hidden group rounded-xl border border-green-500/10 bg-gradient-to-br from-green-500/5 to-transparent p-3 transition-all duration-300 hover:border-green-500/30 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-green-400 font-bold uppercase tracking-widest text-[9px]">Pip Chance</span>
                                                    <CircleDot className="w-3 h-3 text-green-400" />
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <span className="text-foreground/70 text-[10px]">O'Plenty</span>
                                                    <span className="font-mono font-bold text-green-100 text-sm">{fmt(potentials.pips.plenty)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 border border-border rounded-xl border-dashed text-center">
                                        <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-muted-foreground/50 text-sm">Adjust stats to see potential.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Gamma's Wisdom (Full Width) */}
                        {pet.advice && (
                            <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/20 p-5 transition-all hover:bg-muted/30">
                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-500 opacity-70" />
                                <div className="flex gap-4">
                                    <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                                        <Brain className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gamma's Wisdom</h5>
                                        <p className="text-sm text-foreground/90 leading-relaxed font-light">
                                            "{pet.advice}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                                {onDelete && (
                                    <Button 
                                        variant="ghost" 
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs uppercase tracking-widest h-10 px-4 rounded-full transition-all"
                                        onClick={() => {
                                            if(confirm("Release this pet? This action cannot be undone.")) onDelete(pet);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Release
                                    </Button>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    variant="secondary" 
                                    className="bg-muted hover:bg-muted/80 text-foreground border border-border rounded-full px-6"
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
                                            className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full px-6"
                                            onClick={() => onUnlistFromMarketplace(pet)}
                                        >
                                            <EyeOff className="w-4 h-4 mr-2" />
                                            Unlist
                                        </Button>
                                    )
                                ) : (
                                    onListInMarketplace && (
                                        <Button 
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 rounded-full px-8 transition-transform hover:scale-105"
                                            onClick={() => onListInMarketplace(pet)}
                                        >
                                            <Share2 className="w-4 h-4 mr-2" />
                                            List in Kiosk
                                        </Button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Floating Save Bar */}
                        <AnimatePresence>
                            {isDirty && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    className="sticky bottom-0 z-50 flex justify-center w-full pointer-events-none pb-2"
                                >
                                    <div className="pointer-events-auto flex items-center p-1.5 pl-5 pr-1.5 bg-foreground text-background rounded-full shadow-xl border border-border">
                                        <span className="text-xs font-bold mr-4">Unsaved Changes</span>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-background/20 text-background hover:text-background" onClick={handleReset} disabled={isSaving}>
                                                <RotateCcw className="w-3 h-3" />
                                            </Button>
                                            <Button size="sm" className="h-8 rounded-full bg-accent-gold text-black hover:bg-accent-gold/90 font-bold px-4" onClick={handleSave} disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Save"}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
