'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { createThread } from '@/app/olde-town/actions';
import { ForumCategory } from '@/types/firestore';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Compact cards for selection
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PlusCircle, User, Sparkles, Ghost, Hexagon } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
    defaultCategory?: string;
    trigger?: React.ReactNode;
};

const CATEGORIES: { id: ForumCategory, label: string }[] = [
    { id: 'General', label: 'General' },
    { id: 'PVP', label: 'The Arena (PVP)' },
    { id: 'PVE', label: 'Dungeon Strategies' },
    { id: 'Pet Pavilion', label: 'Pet Pavilion' },
    { id: 'Feedback', label: 'Feedback' },
];

export function CreateThreadDialog({ defaultCategory, trigger }: Props) {
    const router = useRouter();
    const { profile, wizards, pets, loading: isLoadingProfile } = useProfile();
    
    // Form State
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<ForumCategory>((defaultCategory as ForumCategory) || 'General');
    
    // Persona & Assets
    const [selectedWizardId, setSelectedWizardId] = useState<string>(''); // "Wolf StormBlade"
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Resolve Wizard Context
        const authorWizard = wizards.find(w => w.id === selectedWizardId);
        
        // Resolve Asset Context
        let attachedAsset = undefined;
        if (selectedPetId) {
            const pet = pets.find(p => p.id === selectedPetId);
            if (pet) {
                attachedAsset = {
                    type: 'pet' as const,
                    id: pet.id,
                    snapshot: {
                        nickname: pet.nickname,
                        body: pet.body,
                        school: pet.school,
                        // Snapshot talents for context even if pet changes later? 
                        // For now, let's keep it minimal, the UI will fetch fresh data or we trust the snap.
                        // Storing minimal snap for preview.
                    }
                };
            }
        } else if (authorWizard) {
             // Maybe attach the wizard themselves if no pet?
             // Optional: "attachedAsset" could explicitly be the Wizard Stats if they choose "Attach My Stats"
             // For now, only Pets are explicit attachments.
        }

        const result = await createThread({
            title,
            content,
            category,
            authorWizardId: authorWizard?.id,
            authorWizardName: authorWizard?.name,
            attachedAsset,
            tags: [] // Todo
        });

        if (result.success && result.threadId) {
            toast.success("Thread Posted!");
            setOpen(false);
            // Reset
            setTitle('');
            setContent('');
            setSelectedPetId(null);
            router.push(`/olde-town/${category.toLowerCase()}?refresh=true`); 
        } else {
            toast.error(result.error || "Failed to post thread.");
        }
        
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="lg" className="bg-accent-gold text-primary-foreground hover:bg-accent-gold/90">
                        <PlusCircle className="mr-2 w-5 h-5" />
                        Post Thread
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Draft a New Scroll</DialogTitle>
                    <DialogDescription>
                        Start a discussion in Olde Town. Remember to follow the Code of Conduct.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Top Row: Category & Persona */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select 
                                value={category} 
                                onValueChange={(v) => setCategory(v as ForumCategory)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Speaking As (Persona)</Label>
                            <Select 
                                value={selectedWizardId} 
                                onValueChange={setSelectedWizardId}
                                disabled={isLoadingProfile}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingProfile ? "Loading Wizards..." : "Select Your Wizard"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anonymous">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span>Anonymous (User)</span>
                                        </div>
                                    </SelectItem>
                                    {wizards.map(w => (
                                        <SelectItem key={w.id} value={w.id}>
                                            <div className="flex items-center gap-2">
                                                <Hexagon className="w-4 h-4 text-accent-gold" />
                                                <span className="font-bold">{w.name}</span>
                                                <span className="text-xs text-muted-foreground">({w.school} Lv.{w.level})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="e.g. Best strategy for Darkmoor Graveyard?"
                            className="text-lg font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Content (Markdown)</Label>
                        <Textarea 
                            value={content} 
                            onChange={e => setContent(e.target.value)} 
                            placeholder="Write your thoughts here..." 
                            className="min-h-[200px] font-mono text-sm"
                            required
                        />
                    </div>

                    {/* Attachments Section */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Sparkles className="w-4 h-4" />
                            Attach an Artifact (Optional)
                        </Label>
                        
                        <Tabs defaultValue="pets" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="pets">My Pets</TabsTrigger>
                                <TabsTrigger value="wizards" disabled>My Wizards (Soon)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pets" className="p-4 border rounded-lg bg-muted/5 mt-2">
                                {pets.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-4">
                                        No pets found in your Tome.
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[200px] pr-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {pets.map(pet => (
                                                <div 
                                                    key={pet.id}
                                                    onClick={() => setSelectedPetId(selectedPetId === pet.id ? null : pet.id)}
                                                    className={`
                                                        cursor-pointer p-3 rounded border transition-all flex items-center gap-3
                                                        ${selectedPetId === pet.id 
                                                            ? 'bg-accent-gold/10 border-accent-gold ring-1 ring-accent-gold' 
                                                            : 'bg-background hover:bg-muted'}
                                                    `}
                                                >
                                                    <Ghost className="w-8 h-8 opacity-50" />
                                                    <div className="overflow-hidden">
                                                        <div className="font-bold truncate">{pet.nickname}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{pet.body}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !title || !content} className="bg-accent-gold text-primary-foreground hover:bg-accent-gold/90 min-w-[120px]">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>Publish Thread</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
