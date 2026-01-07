import { Pet } from '@/types/firestore';
import { calculateTalentValue } from '@/lib/talent-formulas';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Sword, Shield, Crosshair, CircleDashed, Sparkles, BicepsFlexed, Dna,
    Zap, Gem, ScrollText
} from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
    pet: Pet;
    className?: string;
};

// --- Config ---
const PARCHMENT_BG = "bg-[#fcfbf7]"; // Light Cream
const PARCHMENT_BORDER = "border-[#eaddcf]"; 

// Mock Data for "Item Cards" (Cards the pet body gives)
function getItemCards(body: string) {
    const b = body.toLowerCase();
    if (b.includes('rain core')) return ['Supercharge', 'Stormblade'];
    if (b.includes('ghulture')) return ['Deathblade', 'Feint'];
    if (b.includes('gryphon')) return ['Balanceblade', 'Feint'];
    if (b.includes('frillasaur')) return ['Fireblade', 'Fuel'];
    return ['Blade (Generic)']; // Fallback
}

// --- Helpers ---
const TALENT_TYPES = [
    { keywords: ['dealer', 'giver', 'boon', 'bringer', 'pain'], icon: Sword, color: 'bg-red-900/10 text-red-900 border-red-900/20' },
    { keywords: ['proof', 'defy', 'ward', 'block'], icon: Shield, color: 'bg-cyan-900/10 text-cyan-900 border-cyan-900/20' },
    { keywords: ['sniper', 'sharp', 'shot', 'accuracy'], icon: Crosshair, color: 'bg-purple-900/10 text-purple-900 border-purple-900/20' },
    { keywords: ['pierce', 'breaker'], icon: Sword, color: 'bg-yellow-900/10 text-yellow-900 border-yellow-900/20' }, 
    { keywords: ['pip', 'plenty'], icon: CircleDashed, color: 'bg-orange-900/10 text-orange-900 border-orange-900/20' },
    { keywords: ['mighty', 'thinking', 'relentless'], icon: BicepsFlexed, color: 'bg-stone-900/10 text-stone-900 border-stone-900/20' },
    { keywords: ['may cast', 'healing'], icon: Sparkles, color: 'bg-green-900/10 text-green-900 border-green-900/20' }
];

function getTalentMetadata(name: string) {
    const lower = name.toLowerCase();
    const match = TALENT_TYPES.find(t => t.keywords.some(k => lower.includes(k)));
    return match || { icon: Dna, color: 'bg-muted/50 text-muted-foreground border-border/50' };
}

export function PetCard({ pet, className }: Props) {
    const displayTalents = pet.talents.slice(0, 6);
    const itemCards = getItemCards(pet.body);
    const isSocketed = Math.random() > 0.5; // Mock socket status

    return (
        <Card className={clsx(
            "relative group overflow-hidden transition-all duration-300",
            "shadow-sm hover:shadow-md border",
            PARCHMENT_BG, PARCHMENT_BORDER,
            className
        )}>
            {/* "Listed" Badge (Top Right) */}
            <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-stone-300 font-serif text-stone-600 shadow-sm">
                    Listed
                </Badge>
            </div>

            <CardContent className="p-6 flex flex-col h-full gap-5">
                
                {/* 1. Header: Identity */}
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold font-serif text-[#2c241b] tracking-tight group-hover:text-accent-gold transition-colors">
                            {pet.nickname.toUpperCase()}
                        </h3>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-stone-400 font-serif font-bold uppercase tracking-widest">
                                Pedigree
                            </span>
                            <span className="text-sm font-serif font-bold text-stone-600">
                                (35) 75
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                         <Badge variant="secondary" className="rounded-sm px-1.5 py-0 text-[10px] uppercase font-bold text-stone-500 bg-stone-100 border-stone-200">
                            {pet.school || "Balance"}
                        </Badge>
                        <Badge variant="secondary" className="rounded-sm px-1.5 py-0 text-[10px] uppercase font-bold text-stone-500 bg-stone-100 border-stone-200">
                            Mega
                        </Badge>
                        <span className="text-xs font-serif italic text-stone-400">
                            {pet.body}
                        </span>
                    </div>

                    {/* XP Bar (Micro) */}
                    <div className="mt-3 w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-gold/40 w-[75%]" />
                    </div>
                </div>

                {/* 2. Talents Grid */}
                <div className="flex flex-wrap gap-2">
                    {displayTalents.map((talent, i) => {
                        const { icon: Icon, color } = getTalentMetadata(talent);
                        const valueStr = pet.stats ? calculateTalentValue(talent, pet.stats) : null;
                        
                        return (
                            <div key={i} className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border transition-transform hover:scale-105 select-none",
                                color
                            )} title={valueStr || talent}>
                                {valueStr ? (
                                    <>
                                        <span>{talent.split(' ')[0]}</span> 
                                        {/* Truncate long names like "Pain-Giver" -> "Pain" for aesthetics? No, keep logic simple */}
                                    </>
                                ) : (
                                    <span>{talent}</span>
                                )}
                                {valueStr && <span className="opacity-70 text-[10px] ml-0.5">{valueStr}</span>}
                            </div>
                        );
                    })}
                    {pet.talents.length > 5 && (
                        <span className="text-xs font-serif italic text-stone-400 self-center">
                            +{pet.talents.length - 6} more
                        </span>
                    )}
                </div>

                {/* 3. Footer: Stats & Meta */}
                <div className="mt-auto pt-4 border-t border-stone-200/50 flex items-center justify-between text-stone-400">
                    
                    {/* Item Cards Given */}
                    <div className="flex -space-x-2">
                        {itemCards.map((card, i) => (
                            <div key={i} className="w-6 h-8 rounded bg-gradient-to-br from-stone-200 to-stone-300 border border-stone-400 flex items-center justify-center shadow-sm" title={card}>
                                <ScrollText className="w-3 h-3 text-stone-600" />
                            </div>
                        ))}
                    </div>

                    {/* Socket */}
                    <div className="flex items-center gap-2" title="Jewel Socket">
                         <div className={clsx(
                             "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                             isSocketed ? "bg-accent-gold/20 border-accent-gold text-accent-gold" : "border-stone-300 border-dashed text-stone-300"
                         )}>
                             <Gem className="w-3 h-3" />
                         </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
