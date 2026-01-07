import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { ForumThread, ForumCategory } from '@/types/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    MessageSquare, 
    PlusCircle,
    Map,
    Calendar,
    Eye,
    MessageCircle,
    User,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { CreateThreadDialog } from '@/components/forum/CreateThreadDialog';

// --- Types ---
type Props = {
    params: {
        category: string; 
    }
};

const CATEGORY_MAP: Record<string, string> = {
    'general': 'General',
    'pvp': 'PVP',
    'pve': 'PVE',
    'pet-pavilion': 'Pet Pavilion',
    'feedback': 'Feedback'
};

// --- Data Fetching ---
async function getCategoryThreads(categoryId: string): Promise<ForumThread[]> {
    const db = getAdminFirestore();
    
    // Convert url-slug to Enum if needed, or store as lowercase "general"
    // Assuming we store as lowercase in DB for simplicity or match exact string
    // Let's assume we store exact string "general" matches the URL param
    
    const threadsSnap = await db.collection('threads')
        .where('category', '==', categoryId)
        .orderBy('lastReplyAt', 'desc')
        .limit(20)
        .get();

    return threadsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as unknown as ForumThread));
}

// --- Metadata ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const title = CATEGORY_MAP[params.category] || 'Forum';
    return {
        title: `${title} | Olde Town`,
        description: `Join the discussion in the ${title} district.`,
    };
}

// --- Component ---
export default async function CategoryPage({ params }: Props) {
    const categoryTitle = CATEGORY_MAP[params.category];
    
    if (!categoryTitle) return notFound(); // 404 for invalid category

    const threads = await getCategoryThreads(params.category);

    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header & Breadcrumbs */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/olde-town" className="hover:text-accent-gold flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> 
                        Olde Town
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-foreground">{categoryTitle}</span>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold font-serif">{categoryTitle}</h1>
                        <p className="text-muted-foreground">Community Discussions</p>
                    </div>
                    <CreateThreadDialog defaultCategory={categoryTitle} />
                </div>
            </div>

            <Separator />

            {/* Thread List */}
            <div className="space-y-4">
                {threads.length === 0 ? (
                    <Card className="border-dashed py-12 text-center bg-muted/5">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-xl font-medium">It's quiet here...</h3>
                        <p className="text-muted-foreground mb-6">Be the first to start a conversation in this district!</p>
                        <Button variant="outline">Start a Discussion</Button>
                    </Card>
                ) : (
                    threads.map(thread => (
                        <Link href={`/olde-town/thread/${thread.id}`} key={thread.id}>
                            <Card className="hover:border-accent-gold/50 transition-colors cursor-pointer group mb-4">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                        {/* Main Content */}
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                {thread.isPinned && <Badge variant="secondary">📌 Pinned</Badge>}
                                                {thread.tags?.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-bold group-hover:text-accent-gold transition-colors">
                                                {thread.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {thread.authorName}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {thread.createdAt ? formatDistanceToNow(thread.createdAt.toDate(), { addSuffix: true }) : 'Recently'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="flex items-center gap-6 text-muted-foreground">
                                            <div className="text-center min-w-[60px]">
                                                <div className="flex items-center justify-center gap-1 font-bold text-foreground">
                                                    <MessageCircle className="w-4 h-4" />
                                                    {thread.replyCount || 0}
                                                </div>
                                                <div className="text-xs">Replies</div>
                                            </div>
                                            <div className="text-center min-w-[60px]">
                                                <div className="flex items-center justify-center gap-1 font-bold text-foreground">
                                                    <Eye className="w-4 h-4" />
                                                    {thread.viewCount || 0}
                                                </div>
                                                <div className="text-xs">Views</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
