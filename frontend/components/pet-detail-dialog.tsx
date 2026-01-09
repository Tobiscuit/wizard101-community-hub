"use client";

import { useState, useEffect } from 'react';
import { Pet } from '@/types/firestore';
import { calculateTalentValue, calculateAllPotentials } from '@/lib/talent-formulas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Share2, EyeOff, Sparkles, Sword, Shield, Crosshair, Save, RotateCcw, Brain, Activity } from 'lucide-react';
import { clsx } from 'clsx';
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
            // Optionally close or just show success state? 
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
                if (isDirty) {
                    handleReset();
                }
                onClose();
            }
        }}>
            <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-3xl text-foreground border-white/10 p-0 overflow-hidden font-sans shadow-2xl ring-1 ring-white/10">
                
                {/* 1. Header: Clean, Data-First, "Cognitive Scientist" Aesthetic */}
                <DialogHeader className="p-6 pb-4 border-b border-white/5 bg-muted/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-background/50 backdrop-blur border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                                    {pet.petSchool || 'Universal'}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-muted-foreground border-white/10">
                                    {pet.petAge || 'Adult'}
                                </Badge>
                                <div className="h-3 w-px bg-white/10 mx-1" />
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                                    {pet.petType || 'Unknown Entity'}
                                </span>
                            </div>
                            <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                                {pet.nickname || (pet.petType || 'UNKNOWN')}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="relative p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    
                    {/* 2. Stats Workbench (Restored to the version you loved) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left: Attribute Tuning (Stats) - Spans 7 cols */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex justify-between items-center border-b border-border pb-3">
                                <div>
                                    <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-muted-foreground/50" />
                                        Attribute Analysis
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">Adjust base stats to simulate potential power.</p>
                                </div>
                                {isDirty && (
                                    <Badge variant="outline" className="text-accent-gold border-accent-gold/50 animate-pulse bg-accent-gold/10">
                                        SIMULATION ACTIVE
                                    </Badge>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-muted/10 p-4 rounded-xl border border-white/5">
                                <StatInputCell 
                                    label="Strength" 
                                    value={localStats.strength} 
                                    max={255} 
                                    onChange={(v) => handleStatChange('strength', v)}
                                />
                                <StatInputCell 
                                    label="Intellect" 
                                    value={localStats.intellect} 
                                    max={250} 
                                    onChange={(v) => handleStatChange('intellect', v)}
                                />
                                <StatInputCell 
                                    label="Agility" 
                                    value={localStats.agility} 
                                    max={260} 
                                    onChange={(v) => handleStatChange('agility', v)}
                                />
                                <StatInputCell 
                                    label="Will" 
                                    value={localStats.will} 
                                    max={260} 
                                    onChange={(v) => handleStatChange('will', v)}
                                />
                                <StatInputCell 
                                    label="Power" 
                                    value={localStats.power} 
                                    max={250} 
                                    onChange={(v) => handleStatChange('power', v)}
                                />
                            </div>
                        </div>

                        {/* Right: Projected Power (Output) - Spans 5 cols */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="border-b border-border pb-3">
                                <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-accent-gold" />
                                    Projected Output
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">Theoretical maximums based on current attributes.</p>
                            </div>

                            {potentials ? (
                                <div className="space-y-4">
                                    {/* Damage Card */}
                                    <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4 relative overflow-hidden group hover:border-red-500/40 transition-colors">
                                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Sword className="w-12 h-12 text-red-500" />
                                        </div>
                                        <div className="relative z-10">
                                            <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-2">Damage Potential</span>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-end border-b border-red-500/10 pb-1">
                                                    <span className="text-sm text-foreground/80">Dealer</span>
                                                    <span className="text-xl font-mono font-bold text-red-100">{fmt(potentials.damage.dealer)}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-muted-foreground">Giver / Pain</span>
                                                    <span className="text-sm font-mono text-red-200/70">{fmt(potentials.damage.giver)}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-muted-foreground">Boon</span>
                                                    <span className="text-sm font-mono text-red-200/70">{fmt(potentials.damage.boon)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resist Card */}
                                    <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Shield className="w-12 h-12 text-cyan-500" />
                                        </div>
                                        <div className="relative z-10">
                                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">Resist Potential</span>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-end border-b border-cyan-500/10 pb-1">
                                                    <span className="text-sm text-foreground/80">Proof</span>
                                                    <span className="text-xl font-mono font-bold text-cyan-100">{fmt(potentials.resist.proof)}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-muted-foreground">Defy</span>
                                                    <span className="text-sm font-mono text-cyan-200/70">{fmt(potentials.resist.defy)}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-muted-foreground">Ward</span>
                                                    <span className="text-sm font-mono text-cyan-200/70">{fmt(potentials.resist.ward)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pierce Card */}
                                    <div className="bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-xl p-3 flex justify-between items-center group hover:border-yellow-500/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                                                <Crosshair className="w-5 h-5 text-yellow-500" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest block">Pierce</span>
                                                <span className="text-sm font-bold text-foreground">Armor Breaker</span>
                                            </div>
                                        </div>
                                        <span className="text-lg font-mono font-bold text-yellow-100">{fmt(potentials.pierce.breaker)}</span>
                                    </div>
                                </div>
                            ): (
                                <span className="text-muted-foreground text-sm">Cannot calculate potential without stats.</span>
                            )}
                        </div>
                    </div>

                    {/* Floating Save Bar (Bleeding Edge) */}
                    <AnimatePresence>
                        {isDirty && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="sticky bottom-4 left-0 right-0 z-50 flex justify-center w-full pointer-events-none"
                            >
                                <div className="pointer-events-auto flex items-center gap-2 p-1.5 pr-3 bg-foreground text-background rounded-full shadow-2xl shadow-black/50 border border-white/10 ring-1 ring-white/10">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8 rounded-full hover:bg-background/20 text-background hover:text-background"
                                        onClick={handleReset}
                                        disabled={isSaving}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                    <Separator orientation="vertical" className="h-4 bg-background/20" />
                                    <span className="text-xs font-bold pl-1">Unsaved Changes</span>
                                    <Button 
                                        size="sm" 
                                        className="h-8 rounded-full bg-accent-gold text-black hover:bg-accent-gold/90 border-0 ml-2"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 3. Neural Analysis (Cleaner, less "Cyber", more "Research") */}
                    {pet.advice && (
                        <div className="bg-background/40 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-20 pointer-events-none" />
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="mt-0.5 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <Brain className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h5 className="text-sm font-bold text-blue-300 uppercase tracking-widest">Gamma's Insight</h5>
                                    <p className="text-sm text-foreground/80 leading-relaxed font-normal">
                                        "{pet.advice}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator className="bg-white/5" />

                    {/* 4. Footer Actions (Standard, clean, not "Command Module") */}
                    <div className="flex justify-between items-center pt-2">
                         {onDelete && (
                            <Button 
                                variant="ghost" 
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 opacity-70 hover:opacity-100"
                                onClick={() => {
                                    if(confirm("Release this pet? This action cannot be undone.")) onDelete(pet);
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                                Release
                            </Button>
                        )}
                        
                        <div className="flex gap-3">
                            <Button 
                                variant="secondary" 
                                className="gap-2 bg-white/5 hover:bg-white/10"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/marketplace/${pet.id}`);
                                    alert("Link copied!");
                                }}
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>

                            {pet.listedInMarketplace ? (
                                onUnlistFromMarketplace && (
                                    <Button 
                                        variant="outline" 
                                        className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
                                        onClick={() => onUnlistFromMarketplace(pet)}
                                    >
                                        <EyeOff className="w-4 h-4" />
                                        Unlist
                                    </Button>
                                )
                            ) : (
                                onListInMarketplace && (
                                    <Button 
                                        variant="default" // Primary color
                                        className="gap-2 font-semibold shadow-lg shadow-primary/20"
                                        onClick={() => onListInMarketplace(pet)}
                                    >
                                        <Share2 className="w-4 h-4" />
                                        List in Kiosk
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
