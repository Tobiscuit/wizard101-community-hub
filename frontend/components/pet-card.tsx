import React from 'react';
import { Pet } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PetDetailDialog } from "@/components/pet-detail-dialog"; // Integrated Dialog
import { clsx } from 'clsx';
import { 
    Sword, Shield, Crosshair, Sparkles, BicepsFlexed, ArrowRight, Dna,
    CircleDashed
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { updateUserPet } from '@/services/profile-service';
import { toast } from 'sonner';

type Props = {
    pet: Pet;
    className?: string;
    onUpdate?: () => void; // Optional refresh callback if needed
};

// --- Helpers ---
const TALENT_TYPES = [
    { keywords: ['dealer', 'giver', 'boon', 'bringer', 'pain'], icon: Sword, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { keywords: ['proof', 'defy', 'ward', 'block'], icon: Shield, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { keywords: ['sniper', 'sharp', 'shot', 'accuracy'], icon: Crosshair, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { keywords: ['pierce', 'breaker'], icon: Sword, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' }, 
    { keywords: ['pip', 'plenty'], icon: CircleDashed, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    { keywords: ['mighty', 'thinking', 'relentless', 'brilliant', 'powerful', 'cautious'], icon: BicepsFlexed, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' }, 
    { keywords: ['may cast', 'healing', 'sprite', 'unicorn', 'fairy'], icon: Sparkles, color: 'text-green-500 bg-green-500/10 border-green-500/20' }
];

function getTalentMetadata(name: string) {
    const lower = name.toLowerCase();
    const match = TALENT_TYPES.find(t => t.keywords.some(k => lower.includes(k)));
    return match || { icon: Dna, color: 'text-muted-foreground bg-muted/10 border-border/50' };
}

export function PetCard({ pet, className, onUpdate }: Props) {
    const [open, setOpen] = React.useState(false);
    const { data: session } = useSession();

    // Keep the "List View" simple and clean
    const displayTalents = pet.talents.slice(0, 4); 
    const isOwner = session?.user?.id === pet.userId;

    const handlePetUpdate = async (petId: string, stats: Pet['stats']) => {
        if (!isOwner) return;
        try {
            await updateUserPet(pet.userId, petId, { stats });
            toast.success("Pet stats updated.");
            if (onUpdate) onUpdate(); // Trigger parent refresh if provided
        } catch (err) {
            console.error(err);
            toast.error("Failed to update pet.");
        }
    };

    return (
        <>
            <Card 
                onClick={() => setOpen(true)}
                className={clsx(
                "hover:border-primary/50 transition-all cursor-pointer group h-full flex flex-col hover:shadow-md", 
                className
            )}>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold font-serif tracking-tight group-hover:text-primary transition-colors">
                                {pet.nickname}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold">{pet.school}</Badge>
                                {/* TODO: Pull usage/age from pet data if available */}
                            </div>
                        </div>
                        {pet.isLendable && <Badge variant="outline" className="text-xs">Listed</Badge>}
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col gap-4">
                    {/* Simplified Talents for Grid View */}
                    <div className="flex flex-wrap gap-2">
                        {displayTalents.map((talent, i) => {
                            const { color } = getTalentMetadata(talent);
                            return (
                                <Badge key={i} variant="secondary" className={clsx("rounded-sm px-1.5 py-0.5 text-[10px] uppercase font-bold", color)}>
                                    {talent}
                                </Badge>
                            );
                        })}
                        {pet.talents.length > 4 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                                +{pet.talents.length - 4} more
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <PetDetailDialog 
                pet={pet}
                open={open}
                onClose={() => setOpen(false)}
                onUpdate={isOwner ? handlePetUpdate : undefined}
            />
        </>
    );
}
