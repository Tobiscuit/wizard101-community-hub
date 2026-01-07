'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { createReply } from '@/app/olde-town/actions';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Hexagon, User } from 'lucide-react';
import { toast } from 'sonner';

export function ReplyForm({ threadId }: { threadId: string }) {
    const { wizards, loading: isLoadingProfile } = useProfile();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedWizardId, setSelectedWizardId] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        const authorWizard = wizards.find(w => w.id === selectedWizardId);

        const result = await createReply({
            threadId,
            content,
            authorWizardId: authorWizard?.id,
            authorWizardName: authorWizard?.name
        });

        if (result.success) {
            toast.success("Reply posted!");
            setContent('');
        } else {
            toast.error("Failed to reply.");
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="border rounded-xl p-4 bg-card shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Send className="w-4 h-4 text-accent-gold" />
                Leave a Reply
            </h3>

            <div className="flex gap-4">
                 {/* Persona Selector (Compact) */}
                 <div className="w-[180px] shrink-0">
                    <Select 
                        value={selectedWizardId} 
                        onValueChange={setSelectedWizardId}
                        disabled={isLoadingProfile}
                    >
                        <SelectTrigger>
                             <SelectValue placeholder="Speak as..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="anonymous">
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3" /> User
                                </div>
                            </SelectItem>
                            {wizards.map(w => (
                                <SelectItem key={w.id} value={w.id}>
                                    <div className="flex items-center gap-2">
                                        <Hexagon className="w-3 h-3 text-accent-gold" />
                                        <span className="truncate max-w-[100px]">{w.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Join the discussion..."
                    className="min-h-[100px] font-mono text-sm resize-y"
                />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !content} className="bg-accent-gold text-primary-foreground hover:bg-accent-gold/90">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Reply"}
                </Button>
            </div>
        </form>
    );
}
