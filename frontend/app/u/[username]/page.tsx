import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Wizard, UserProfile } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { 
    Flame, Snowflake, Zap, ghost, Leaf, Scale, Swords, Users, Trophy, Ghost
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Types ---
type Props = {
    params: {
        username: string; // e.g. "tobiscuit"
    }
};

type DirectoryData = {
    user: UserProfile;
    wizards: Wizard[];
};

// --- Helpers ---
const SCHOOL_ICONS: Record<string, any> = {
    'Fire': Flame, 'Ice': Snowflake, 'Storm': Zap, 'Myth': Ghost, 
    'Life': Leaf, 'Death': Ghost, 'Balance': Scale
};

const SCHOOL_COLORS: Record<string, string> = {
    'Fire': 'text-red-500 border-red-500/20 bg-red-500/10',
    'Ice': 'text-cyan-500 border-cyan-500/20 bg-cyan-500/10',
    'Storm': 'text-purple-500 border-purple-500/20 bg-purple-500/10',
    'Myth': 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
    'Life': 'text-green-500 border-green-500/20 bg-green-500/10',
    'Death': 'text-slate-500 border-slate-500/20 bg-slate-500/10',
    'Balance': 'text-orange-500 border-orange-500/20 bg-orange-500/10',
};

// --- Data Fetching ---
async function getDirectoryData(username: string): Promise<DirectoryData | null> {
    const db = getAdminFirestore();
    const decodedUsername = decodeURIComponent(username).replace('@', ''); 

    // 1. Find User
    const usersSnap = await db.collection('users')
        .where('displayName', '==', decodedUsername)
        .limit(1)
        .get();

    if (usersSnap.empty) return null;

    const userDoc = usersSnap.docs[0];
    // Sanitize User
    const rawUser = userDoc.data() as UserProfile;
    const user: Partial<UserProfile> = {
        displayName: rawUser.displayName,
        photoURL: rawUser.photoURL,
        hatchReputation: rawUser.hatchReputation,
        marketReputation: rawUser.marketReputation,
        vouchCount: rawUser.vouchCount,
        // No Email
    };

    // 2. Get All Wizards
    const wizardsSnap = await db.collection('wizards')
        .where('userId', '==', userDoc.id)
        .get();

    const wizards = wizardsSnap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Wizard));

    return { user: user as unknown as UserProfile, wizards };
}

// --- Metadata ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // We assume the user exists for the title, or generic fallbacks
    const decodedName = decodeURIComponent(params.username).replace('@', '');
    return {
        title: `${decodedName}'s Wizards | The Commons`,
        description: `View the wizard roster of ${decodedName}.`,
    };
}

// --- Component ---
export default async function UserDirectoryPage({ params }: Props) {
    const data = await getDirectoryData(params.username);

    if (!data) notFound();

    const { user, wizards } = data;

    return (
        <div className="container mx-auto max-w-5xl py-12 px-4 space-y-8 animate-in fade-in duration-500">
             {/* Header */}
             <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent-gold shadow-xl">
                    <img 
                        src={user.photoURL || 'https://api.dicebear.com/9.x/notionists/svg?seed=Sorcerer'} 
                        alt={user.displayName} 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <div>
                    <h1 className="text-4xl font-bold font-serif">{user.displayName}</h1>
                    <p className="text-muted-foreground">Authorized Wizard</p>
                </div>
                <div className="flex gap-4">
                    <Badge variant="secondary" className="px-4 py-1 text-base">
                        🛡️ Trust Score: {user.hatchReputation + user.marketReputation + user.vouchCount}
                    </Badge>
                </div>
             </div>

             <Separator />

             {/* Wizard Grid */}
             <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-serif">Wizard Roster</h2>
                    <Badge variant="outline">{wizards.length} Characters</Badge>
                </div>

                {wizards.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No Wizards Found</h3>
                        <p className="text-muted-foreground">This user hasn't registered any wizards yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wizards.map(wiz => {
                            const Icon = SCHOOL_ICONS[wiz.school] || Zap;
                            const colorClass = SCHOOL_COLORS[wiz.school] || 'text-slate-500 border-slate-500/20 bg-slate-500/10';
                            // Slug generation: wolf-stormblade
                            // Fallback to name-based slug if not stored
                            const slug = wiz.name.toLowerCase().replace(/\s+/g, '-');
                            
                            return (
                                <Link 
                                    href={`/u/${params.username.replace('@','')}/${slug}`} 
                                    key={wiz.id}
                                    className="group"
                                >
                                    <Card className="h-full hover:border-accent-gold/50 transition-all hover:shadow-md cursor-pointer relative overflow-hidden">
                                         <div className={clsx("absolute top-0 left-0 w-1 h-full", colorClass.split(' ')[1])} />
                                         <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="flex items-center gap-2 group-hover:text-accent-gold transition-colors">
                                                    <Icon className={clsx("w-5 h-5", colorClass.split(' ')[0])} />
                                                    {wiz.name}
                                                </CardTitle>
                                                <Badge variant="secondary">Lvl {wiz.level}</Badge>
                                            </div>
                                            <CardDescription>{wiz.school}</CardDescription>
                                         </CardHeader>
                                         <CardContent>
                                            <p className="text-sm italic text-muted-foreground line-clamp-2">
                                                "{wiz.bio || 'A mysterious wizard.'}"
                                            </p>
                                         </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
             </section>
        </div>
    );
}
