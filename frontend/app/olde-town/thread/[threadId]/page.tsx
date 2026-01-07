import { notFound } from 'next/navigation';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { ForumThread, ForumPost } from '@/types/firestore';
import { PetCard } from '@/components/pet-card';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    MessageSquare, 
    Calendar,
    Eye,
    MessageCircle,
    User,
    ArrowLeft,
    Share2,
    Flag,
    Hexagon
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

// --- Types ---
type Props = {
    params: {
        threadId: string; 
    }
};

import { ReplyForm } from '@/components/forum/ReplyForm';

// ... (existing imports)

// --- Data Fetching ---
async function getThread(threadId: string) {
    const db = getAdminFirestore();
    const docSnap = await db.collection('threads').doc(threadId).get();

    if (!docSnap.exists) return null;

    return { id: docSnap.id, ...docSnap.data() } as unknown as ForumThread;
}

async function getThreadReplies(threadId: string) {
    const db = getAdminFirestore();
    const snaps = await db.collection('threads').doc(threadId).collection('posts')
        .orderBy('createdAt', 'asc')
        .get();

    return snaps.docs.map(d => ({ id: d.id, ...d.data() } as unknown as ForumPost));
}

// --- Components ---

function AuthorBadge({ name, isWizard }: { name: string, isWizard?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-muted/10 rounded-lg min-w-[120px] text-center">
            <Avatar className="w-16 h-16 border-2 border-accent-gold/20">
                <AvatarFallback className="bg-background text-2xl font-serif">
                    {name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div>
                <div className="font-bold text-sm flex items-center justify-center gap-1">
                    {isWizard && <Hexagon className="w-3 h-3 text-accent-gold" />}
                    {name}
                </div>
                {isWizard && <Badge variant="secondary" className="text-[10px] mt-1 scale-90">Wizard</Badge>}
            </div>
        </div>
    );
}

export default async function ThreadPage({ params }: Props) {
    const thread = await getThread(params.threadId);
    
    if (!thread) return notFound();

    const replies = await getThreadReplies(params.threadId);

    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-8 animate-in fade-in duration-500">
             {/* ... Header ... */}
             
             {/* ... OP Content ... */}
             
             {/* (Keep existing render logic for Header and OP) */}
             
             <Separator className="my-8" />

            {/* Replies Section */}
            <div className="space-y-8">
                 <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-serif font-bold">Replies</h2>
                    <Badge variant="secondary">{replies.length}</Badge>
                 </div>

                 {replies.length === 0 ? (
                     <Card className="border-dashed p-8 text-center text-muted-foreground bg-muted/5">
                        <p>No replies yet. Be the first to join the conversation!</p>
                     </Card>
                 ) : (
                     <div className="space-y-6">
                        {replies.map(post => (
                            <Card key={post.id} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Author Side */}
                                    <div className="md:w-40 bg-muted/30 p-4 border-r border-border/50 flex flex-col items-center justify-center md:justify-start">
                                        <AuthorBadge 
                                            name={post.authorWizardId ? (post.authorWizardName || post.authorName) : post.authorName} 
                                            isWizard={!!post.authorWizardId}
                                        />
                                        <div className="text-[10px] text-muted-foreground mt-2 text-center">
                                            {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                        </div>
                                    </div>
                                    
                                    {/* Content Side */}
                                    <div className="flex-1 p-6">
                                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                            <ReactMarkdown>{post.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                     </div>
                 )}

                 {/* Reply Form */}
                 <div className="pt-4">
                     <ReplyForm threadId={thread.id} />
                 </div>
            </div>
            
        </div>
    );
}
