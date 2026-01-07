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

// --- Data Fetching ---
async function getThread(threadId: string) {
    const db = getAdminFirestore();
    const docSnap = await db.collection('threads').doc(threadId).get();

    if (!docSnap.exists) return null;

    return { id: docSnap.id, ...docSnap.data() } as unknown as ForumThread;
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

    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-8 animate-in fade-in duration-500">
            {/* Nav & Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/olde-town" className="hover:text-accent-gold flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> 
                        Olde Town
                    </Link>
                    <span>/</span>
                    <Link href={`/olde-town/${thread.category.toLowerCase()}`} className="hover:text-foreground">
                        {thread.category}
                    </Link>
                    <span>/</span>
                    <span className="truncate max-w-[200px]">{thread.title}</span>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
                            {thread.title}
                        </h1>
                        <div className="flex items-center gap-2 shrink-0">
                            {thread.isPinned && <Badge variant="secondary">📌 Pinned</Badge>}
                            <Badge className="bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 border-accent-gold/20">
                                {thread.category}
                            </Badge>
                        </div>
                    </div>
                    
                    {/* Meta Bar */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-4">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span className="hidden sm:inline">Posted</span> {formatDistanceToNow(thread.createdAt.toDate(), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {thread.viewCount} Views
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {thread.replyCount} Replies
                            </span>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive">
                                <Flag className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content (OP) */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
                
                {/* Author Column */}
                <div className="hidden md:block">
                    <AuthorBadge 
                        name={thread.authorWizardId ? (thread.authorWizardName || thread.authorName) : thread.authorName} 
                        isWizard={!!thread.authorWizardId}
                    />
                </div>

                {/* Post Content Column */}
                <div className="space-y-6">
                    {/* Mobile Author */}
                    <div className="md:hidden">
                        <AuthorBadge 
                            name={thread.authorWizardId ? (thread.authorWizardName || thread.authorName) : thread.authorName} 
                            isWizard={!!thread.authorWizardId}
                        />
                    </div>

                    <Card className="min-h-[200px] shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            {/* Markdown Body */}
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                    {thread.content}
                                </ReactMarkdown>
                            </div>

                            {/* Tags */}
                            {thread.tags && thread.tags.length > 0 && (
                                <div className="flex gap-2 pt-4">
                                    {thread.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Attached Asset */}
                    {thread.attachedAsset && (
                        <div className="animate-in slide-in-from-left duration-700">
                             <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="bg-accent-gold w-1 h-4 rounded-full" />
                                Referenced Artifact
                            </h3>
                            {thread.attachedAsset.type === 'pet' && (
                                <div className="max-w-sm">
                                    {/* Construct a transient Pet object from snapshot+id */}
                                    <Link href={`/marketplace/pet/${thread.attachedAsset.id}`}>
                                        <PetCard pet={{
                                            id: thread.attachedAsset.id,
                                            ...thread.attachedAsset.snapshot,
                                            talents: thread.attachedAsset.snapshot.talents || [] // Ensure array
                                        } as any} /> 
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            <Separator className="my-8" />

            {/* Replies Section (Placeholder) */}
            <div className="space-y-6">
                 <h2 className="text-2xl font-serif font-bold">Replies</h2>
                 <Card className="border-dashed p-8 text-center text-muted-foreground bg-muted/5">
                    <p>No replies yet. Use the Reply Button to join the conversation!</p>
                 </Card>
            </div>
            
        </div>
    );
}
