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
    Save, RotateCcw, BrainCircuit, Terminal, Activity, Tag, 
    Fingerprint, User, Calendar
} from 'lucide-react';
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
            <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-3xl text-foreground border-white/10 p-0 overflow-hidden font-sans shadow-2xl ring-1 ring-white/10">
                
                {/* 1. Identity Matrix Header */}
                <div className="relative bg-muted/10 border-b border-white/5 p-6 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                    <div className="absolute top-0 right-0 p-12 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-background/50 backdrop-blur border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-sm">
                                    <Fingerprint className="w-3 h-3" />
                                    Subject ID: {pet.id?.slice(0, 8).toUpperCase() || 'UNKNOWN'}
                                </Badge>
                                <Badge variant="outline" className="bg-background/50 backdrop-blur border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-sm">
                                    <Calendar className="w-3 h-3" />
                                    Generation: {pet.petAge || 'ADULT'}
                                </Badge>
                            </div>
                            <DialogTitle className="text-4xl font-extrabold tracking-tight text-foreground uppercase">
                                {pet.nickname || pet.petType || 'UNKNOWN'}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono text-accent-gold uppercase tracking-wider">
                                    // {pet.petSchool || 'UNIVERSAL'} CLASS
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                    TYPE: {pet.petType || 'Standard'}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats Mini-HUD */}
                        <div className="flex gap-4">
                            <div className="text-right">
                                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Genome</span>
                                <span className="block text-xl font-mono font-bold text-foreground">
                                    {Object.values(localStats).reduce((a, b) => a + b, 0)}
                                </span>
                            </div>
                            <div className="w-px bg-white/10 h-10" />
                            <div className="text-right">
                                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Talents</span>
                                <span className="block text-xl font-mono font-bold text-foreground">
                                    {pet.talents?.length || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-background to-muted/5">
                    
                    {/* 2. Stats Workbench (Existing "Bleeding Edge" implementation) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Attribute Tuning */}
                        <div className="lg:col-span-7 space-y-5">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-muted-foreground/50" />
                                    Attribute Tuning
                                </h4>
                                {isDirty && (
                                    <Badge variant="outline" className="text-accent-gold border-accent-gold/30 animate-pulse bg-accent-gold/5 text-[10px]">
                                        SIMULATION ACTIVE
                                    </Badge>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5 shadow-inner">
                                <StatInputCell label="Strength" value={localStats.strength} max={255} onChange={(v) => handleStatChange('strength', v)} />
                                <StatInputCell label="Intellect" value={localStats.intellect} max={250} onChange={(v) => handleStatChange('intellect', v)} />
                                <StatInputCell label="Agility" value={localStats.agility} max={260} onChange={(v) => handleStatChange('agility', v)} />
                                <StatInputCell label="Will" value={localStats.will} max={260} onChange={(v) => handleStatChange('will', v)} />
                                <StatInputCell label="Power" value={localStats.power} max={250} onChange={(v) => handleStatChange('power', v)} />
                            </div>
                        </div>

                        {/* Right: Projected Power */}
                        <div className="lg:col-span-5 space-y-5">
                            <div className="border-b border-white/5 pb-3">
                                <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-accent-gold" />
                                    Projected Output
                                </h4>
                            </div>

                            {potentials ? (
                                <div className="space-y-3">
                                    {/* Damage */}
                                    <div className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-xl p-3 relative overflow-hidden group transition-all duration-300">
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-500/10 rounded-lg"><Sword className="w-4 h-4 text-red-500" /></div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Damage</span>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <span>Dlr: <b className="text-foreground">{fmt(potentials.damage.dealer)}</b></span>
                                                        <span>Gvr: <b className="text-foreground">{fmt(potentials.damage.giver)}</b></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resist */}
                                    <div className="bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl p-3 relative overflow-hidden group transition-all duration-300">
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-cyan-500/10 rounded-lg"><Shield className="w-4 h-4 text-cyan-500" /></div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Resist</span>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <span>Prf: <b className="text-foreground">{fmt(potentials.resist.proof)}</b></span>
                                                        <span>Dfy: <b className="text-foreground">{fmt(potentials.resist.defy)}</b></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pierce */}
                                    <div className="bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/10 hover:border-yellow-500/30 rounded-xl p-3 relative overflow-hidden group transition-all duration-300">
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-500/10 rounded-lg"><Crosshair className="w-4 h-4 text-yellow-500" /></div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest block">Pierce</span>
                                                    <span className="text-xs text-muted-foreground">Breaker: <b className="text-foreground">{fmt(potentials.pierce.breaker)}</b></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-sm">Awaiting neural input...</span>
                            )}
                        </div>
                    </div>

                    {/* 3. Neural Analysis (Gamma's Wisdom Redesign) */}
                    {pet.advice && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4" />
                                Neural Analysis
                            </h4>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative bg-black/40 border border-white/10 rounded-xl p-5 backdrop-blur-md">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <Terminal className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-blue-400">gamma_core_v9.2</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">CONFIDENCE: 98.4%</span>
                                            </div>
                                            <p className="text-sm text-foreground/90 font-mono leading-relaxed">
                                                <span className="text-blue-500 mr-2">{">"}</span>
                                                {pet.advice}
                                                <span className="animate-pulse inline-block w-2 h-4 bg-blue-500/50 align-middle ml-1" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating Save Bar */}
                    <AnimatePresence>
                        {isDirty && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className="sticky bottom-0 z-50 flex justify-center w-full pointer-events-none pb-4"
                            >
                                <div className="pointer-events-auto flex items-center gap-2 p-1.5 pr-3 bg-[#0a0a0a] text-white rounded-full shadow-2xl shadow-black/80 border border-white/10 ring-1 ring-white/10">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={handleReset} disabled={isSaving}>
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                    <Separator orientation="vertical" className="h-4 bg-white/20" />
                                    <span className="text-xs font-bold pl-1 tracking-wide">PARAMETERS CHANGED</span>
                                    <Button size="sm" className="h-8 rounded-full bg-accent-gold text-black hover:bg-accent-gold/90 border-0 ml-2 font-bold" onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? "SAVING..." : "COMMIT CHANGES"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Command Module Footer */}
                <div className="p-4 bg-muted/10 border-t border-white/5 flex justify-between items-center backdrop-blur-md">
                    <div>
                         {onDelete && (
                            <Button variant="ghost" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 gap-2 h-9 px-3 text-xs uppercase tracking-wider" onClick={() => {
                                if(confirm("Release this pet? This action cannot be undone.")) onDelete(pet);
                            }}>
                                <Trash2 className="w-3 h-3" />
                                Terminate Subject
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <Button variant="secondary" className="gap-2 h-9 text-xs uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/5" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/marketplace/${pet.id}`);
                            alert("Link copied!");
                        }}>
                            <Share2 className="w-3 h-3" />
                            Share Data
                        </Button>

                        {pet.listedInMarketplace ? (
                            onUnlistFromMarketplace && (
                                <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10 gap-2 h-9 text-xs uppercase tracking-wider" onClick={() => onUnlistFromMarketplace(pet)}>
                                    <EyeOff className="w-3 h-3" />
                                    Retract Listing
                                </Button>
                            )
                        ) : (
                            onListInMarketplace && (
                                <Button className="gap-2 h-9 text-xs uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20" onClick={() => onListInMarketplace(pet)}>
                                    <Share2 className="w-3 h-3" />
                                    Broadcast to Kiosk
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
