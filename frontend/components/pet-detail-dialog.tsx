import { useState, useEffect } from 'react';
import { Pet } from '@/types/firestore';
import { calculateTalentValue, calculateAllPotentials } from '@/lib/talent-formulas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Share2, EyeOff, Sparkles, Sword, Shield, Crosshair, Save, RotateCcw } from 'lucide-react';
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
            // Bleeding edge interaction: Bar transforms to "Saved" then disappears.
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
                    // Bleeding edge: Just close? Or confirm? 
                    // 2026 UX prefers "Soft Close" -> We reset changes on close usually, or auto-save.
                    // We'll reset for safety unless auto-save is desired.
                    handleReset();
                }
                onClose();
            }
        }}>
            <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl text-foreground border-border p-0 overflow-hidden font-serif shadow-2xl">
                
                {/* Header */}
                <DialogHeader className="p-6 pb-4 bg-muted/20 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-3xl font-bold tracking-wide text-foreground">
                                {pet.nickname ? pet.nickname.toUpperCase() : (pet.petType || 'UNKNOWN').toUpperCase()}
                            </DialogTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="uppercase text-xs tracking-wider">
                                    {pet.petSchool || pet.school || 'Unknown'}
                                </Badge>
                                <Badge variant="secondary" className="uppercase text-xs tracking-wider">
                                    {pet.petAge || 'Adult'}
                                </Badge>
                                <Badge variant="outline" className="uppercase text-xs tracking-wider border-border text-muted-foreground">
                                    {(pet.petType || pet.body || 'Unknown').toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="relative p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Col 1: Base Stats (Editable) */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-border pb-2">
                                <h4 className="text-lg font-bold text-foreground">Base Stats</h4>
                                {isDirty && (
                                    <span className="text-[10px] text-accent-gold animate-pulse">Modified</span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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

                        {/* Col 2: Max Potential (Reactive) */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-foreground border-b border-border pb-2">Max Potential</h4>
                            {potentials ? (
                                <div className="space-y-3 text-sm opacity-90 hover:opacity-100 transition-opacity">
                                    {/* Damage */}
                                    <div className="flex items-center gap-2 group">
                                        <div className="p-1.5 bg-red-500/10 rounded-md group-hover:bg-red-500/20 transition-colors">
                                           <Sword className="w-4 h-4 text-red-500" />
                                        </div>
                                        <span className="text-red-500 font-bold w-16">Damage</span>
                                        <div className="flex gap-3 text-muted-foreground text-xs">
                                            <span>Dlr:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.damage.dealer)}</span></span>
                                            <span>Gvr:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.damage.giver)}</span></span>
                                            <span>Bn:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.damage.boon)}</span></span>
                                        </div>
                                    </div>
                                    {/* Resist */}
                                    <div className="flex items-center gap-2 group">
                                        <div className="p-1.5 bg-cyan-500/10 rounded-md group-hover:bg-cyan-500/20 transition-colors">
                                            <Shield className="w-4 h-4 text-cyan-500" />
                                        </div>
                                        <span className="text-cyan-500 font-bold w-16">Resist</span>
                                        <div className="flex gap-3 text-muted-foreground text-xs">
                                            <span>Prf:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.resist.proof)}</span></span>
                                            <span>Dfy:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.resist.defy)}</span></span>
                                            <span>Wrd:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.resist.ward)}</span></span>
                                        </div>
                                    </div>
                                    {/* Pierce */}
                                    <div className="flex items-center gap-2 group">
                                        <div className="p-1.5 bg-yellow-500/10 rounded-md group-hover:bg-yellow-500/20 transition-colors">
                                            <Crosshair className="w-4 h-4 text-yellow-500" />
                                        </div>
                                        <span className="text-yellow-500 font-bold w-16">Pierce</span>
                                        <div className="flex gap-3 text-muted-foreground text-xs">
                                            <span>Brk:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.pierce.breaker)}</span></span>
                                            <span>Prc:<span className="text-foreground ml-0.5 font-mono">{fmt(potentials.pierce.piercer)}</span></span>
                                        </div>
                                    </div>
                                </div>
                            ): (
                                <span className="text-muted-foreground text-sm">Cannot calculate potential without stats.</span>
                            )}
                        </div>
                    </div>

                    {/* Manifested Talents */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-foreground border-b border-border pb-2">Manifested Talents</h4>
                        {pet.talents && pet.talents.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {pet.talents.map((t, i) => {
                                    const val = localStats ? calculateTalentValue(t, localStats) : null;
                                    return (
                                        <Badge key={i} variant="outline" className="px-3 py-1.5 border-border text-foreground bg-muted/30 hover:bg-muted transition-colors rounded-full flex items-center gap-2">
                                            <span className="uppercase font-bold tracking-wide text-xs">{t}</span>
                                            {val && <span className="font-mono text-primary text-xs">({val})</span>}
                                        </Badge>
                                    );
                                })}
                            </div>
                         ) : (
                            <span className="text-muted-foreground text-sm italic">No talents manifested yet.</span>
                         )}
                    </div>

                    {/* Floating Save Bar (Bleeding Edge) */}
                    {/* Positioned absolutely within the scroll container or fixed relative to Dialog */}
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

                    {/* Gamma's Wisdom */}
                    {pet.advice && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 relative">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <h5 className="font-bold text-blue-600 dark:text-blue-400 mb-1">Gamma's Wisdom</h5>
                                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                                        "{pet.advice}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator className="bg-border" />

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-2">
                         {onDelete && (
                            <Button 
                                variant="ghost" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
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
                                className="gap-2"
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
                                        className="gap-2"
                                        onClick={() => onListInMarketplace(pet)}
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Kiosk List
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
