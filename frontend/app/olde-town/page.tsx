import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    MessageSquare, 
    Swords, 
    Shield, 
    Ghost, 
    Lightbulb, 
    PlusCircle,
    Map,
    Users
} from "lucide-react";
import Link from "next/link";
import { CreateThreadDialog } from "@/components/forum/CreateThreadDialog";

// --- Configuration ---
const CATEGORIES = [
    {
        id: 'general',
        title: 'General',
        description: 'Talk about anything and everything Wizard101.',
        icon: MessageSquare,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
        id: 'pvp',
        title: 'The Arena (PVP)',
        description: 'Strategies, meta discussions, and duel requests.',
        icon: Swords,
        color: 'text-red-500 bg-red-500/10 border-red-500/20'
    },
    {
        id: 'pve',
        title: 'Dungeon Strategies',
        description: 'Guides for bosses, farming runs, and quest help.',
        icon: Shield,
        color: 'text-green-500 bg-green-500/10 border-green-500/20'
    },
    {
        id: 'pet-pavilion',
        title: 'Pet Pavilion',
        description: 'Hatching meetups, talent theory, and showoffs.',
        icon: Ghost,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
        id: 'feedback',
        title: 'Feedback',
        description: 'Suggestions for The Commons platform.',
        icon: Lightbulb,
        color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    }
];

export default function OldeTownPage() {
    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold font-serif flex items-center gap-3">
                        <Map className="w-8 h-8 text-accent-gold" />
                        Olde Town
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        The central hub for all wizardly discourse.
                    </p>
                </div>
                <CreateThreadDialog />
            </div>

            <Separator />

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat) => (
                    <Link href={`/olde-town/${cat.id}`} key={cat.id} className="group">
                        <Card className="h-full hover:border-accent-gold/50 transition-all hover:shadow-lg cursor-pointer">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                                        <cat.icon className="w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="opacity-50">0 Threads</Badge>
                                </div>
                                <CardTitle className="mt-4 text-xl group-hover:text-accent-gold transition-colors">
                                    {cat.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {cat.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    Last post: <span className="italic">Never</span>
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="space-y-4 pt-8">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-2xl font-bold font-serif">Recent Conversations</h2>
                </div>
                
                <Card className="min-h-[200px] flex flex-col items-center justify-center text-muted-foreground border-dashed">
                    <p>The town square is quiet...</p>
                    <p className="text-sm">Be the first to speak!</p>
                </Card>
            </div>
        </div>
    );
}
