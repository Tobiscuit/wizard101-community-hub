import { Pet } from '@/types/firestore';
import { calculateTalentValue, calculateAllPotentials } from '@/lib/talent-formulas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Share2, EyeOff, Sparkles, Sword, Shield, Crosshair } from 'lucide-react';
import { clsx } from 'clsx';
import { ReactNode } from 'react';

type Props = {
    pet: Pet;
    children: ReactNode; // The Trigger (e.g., PetCard)
};

export function PetDetailDialog({ pet, children }: Props) {
    const potentials = pet.stats ? calculateAllPotentials(pet.stats) : null;

    // Helper to format percentage
    const fmt = (val?: number) => val ? `${val}%` : '-';

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-background text-foreground border-border p-0 overflow-hidden font-serif">
                
                {/* Header */}
                <DialogHeader className="p-6 pb-4 bg-muted/20 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-3xl font-bold tracking-wide text-foreground">
                                {pet.nickname.toUpperCase()}
                            </DialogTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="uppercase text-xs tracking-wider">
                                    {pet.school || 'Unknown'}
                                </Badge>
                                <Badge variant="secondary" className="uppercase text-xs tracking-wider">
                                    Mega
                                </Badge>
                                <Badge variant="outline" className="uppercase text-xs tracking-wider border-border text-muted-foreground">
                                    {pet.body.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Col 1: Base Stats */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-foreground border-b border-border pb-2">Base Stats</h4>
                            {pet.stats && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <StatRow label="Strength" val={pet.stats.strength} max={255} />
                                    <StatRow label="Intellect" val={pet.stats.intellect} max={250} />
                                    <StatRow label="Agility" val={pet.stats.agility} max={260} />
                                    <StatRow label="Will" val={pet.stats.will} max={260} />
                                    <StatRow label="Power" val={pet.stats.power} max={250} />
                                </div>
                            )}
                        </div>

                        {/* Col 2: Max Potential */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-foreground border-b border-border pb-2">Max Potential</h4>
                            {potentials && (
                                <div className="space-y-3 text-sm">
                                    {/* Damage */}
                                    <div className="flex items-center gap-2">
                                        <Sword className="w-4 h-4 text-red-500" />
                                        <span className="text-red-500 font-bold w-16">Damage</span>
                                        <div className="flex gap-3 text-muted-foreground text-xs">
                                            <span>Dlr:<span className="text-foreground ml-0.5">{fmt(potentials.damage.dealer)}</span></span>
                                            <span>Gvr:<span className="text-foreground ml-0.5">{fmt(potentials.damage.giver)}</span></span>
                                            <span>Bn:<span className="text-foreground ml-0.5">{fmt(potentials.damage.boon)}</span></span>
                                        </div>
                                    </div>
                                    {/* Resist */}
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-cyan-500" />
                                        <span className="text-cyan-500 font-bold w-16">Resist</span>
                                        <div className="flex gap-3 text-muted-foreground text-xs">
                                            <span>Prf:<span className="text-foreground ml-0.5">{fmt(potentials.resist.proof)}</span></span>
                                            <span>Dfy:<span className="text-foreground ml-0.5">{fmt(potentials.resist.defy)}</span></span>
                                            <span>Wrd:<span className="text-foreground ml-0.5">{fmt(potentials.resist.ward)}</span></span>
                                        </div>
                                    </div>
                                    {/* Pierce */}
                                    <div className="flex items-center gap-2">
                                        <Crosshair className="w-4 h-4 text-yellow-500" />
                                        <span className="text-yellow-500 font-bold w-16">Pierce</span>
                                        <div className="flex gap-3 text-muted-foreground text-xs">
                                            <span>Brk:<span className="text-foreground ml-0.5">{fmt(potentials.pierce.breaker)}</span></span>
                                            <span>Prc:<span className="text-foreground ml-0.5">{fmt(potentials.pierce.piercer)}</span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manifested Talents */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-foreground border-b border-border pb-2">Manifested Talents</h4>
                        <div className="flex flex-wrap gap-3">
                            {pet.talents.map((t, i) => {
                                const val = pet.stats ? calculateTalentValue(t, pet.stats) : null;
                                return (
                                    <Badge key={i} variant="outline" className="px-3 py-1.5 border-border text-foreground bg-muted/30 hover:bg-muted transition-colors rounded-full flex items-center gap-2">
                                        <span className="uppercase font-bold tracking-wide text-xs">{t}</span>
                                        {val && <span className="font-mono text-primary text-xs">({val})</span>}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    {/* Gamma's Wisdom */}
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 relative">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                                <h5 className="font-bold text-blue-600 dark:text-blue-400 mb-1">Gamma's Wisdom</h5>
                                <p className="text-sm text-muted-foreground italic leading-relaxed">
                                    "This pet has promising damage talents like Pain-Giver. However, the low intellect stat is a drawback. It is not a meta pet, but could be a decent start for building a pet with more specialized talents."
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border" />

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-2">
                         <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                            <Trash2 className="w-4 h-4" />
                            Release Pet
                        </Button>
                        
                        <div className="flex gap-3">
                            <Button variant="secondary" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>
                            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
                                <EyeOff className="w-4 h-4" />
                                Unlist from Kiosk
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Sub-component for Stats
function StatRow({ label, val, max }: { label: string, val: number, max: number }) {
    return (
        <div className="flex justify-between items-center bg-muted/40 px-3 py-2 rounded">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="font-mono font-bold text-foreground">{val}</span>
                <span className="text-[10px] text-muted-foreground/50">/{max}</span>
            </div>
        </div>
    );
}
