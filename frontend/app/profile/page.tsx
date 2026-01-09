"use client";

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useSession, signIn } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
    ShieldCheck, 
    Zap, 
    Users, 
    Trophy, 
    Swords, 
    Ghost, 
    Flame, 
    Droplets, 
    Snowflake, 
    Scale, 
    Leaf,
    PawPrint,
    LogIn
} from 'lucide-react';
import { clsx } from 'clsx';
import { Wizard, Pet } from '@/types/firestore';

// --- Components ---

// 1. Trust Score Badge
function TrustBadge({ hatch, market, vouch }: { hatch: number, market: number, vouch: number }) {
    const total = hatch + market + vouch;
    
    // Determine tier color based on total
    const tierColor = total > 1000 ? "text-purple-400 border-purple-400" :
                      total > 500 ? "text-blue-400 border-blue-400" :
                      total > 100 ? "text-green-400 border-green-400" :
                      "text-slate-400 border-slate-400";

    return (
        <div className={clsx("flex flex-col items-center p-4 border rounded-xl bg-card/50 backdrop-blur-sm", tierColor)}>
            <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-8 h-8" />
                <span className="text-3xl font-bold font-mono">{total}</span>
            </div>
            <span className="text-xs uppercase tracking-widest opacity-70 mb-3">Community Trust</span>
            
            {/* Breakdown */}
            <div className="flex gap-3 text-xs opacity-60">
                <div className="flex items-center gap-1" title="Verified Hatches">
                    <PawPrint className="w-3 h-3" /> {hatch}
                </div>
                <div className="flex items-center gap-1" title="Market Trades">
                    <Scale className="w-3 h-3" /> {market}
                </div>
                <div className="flex items-center gap-1" title="Vouches">
                    <Users className="w-3 h-3" /> {vouch}
                </div>
            </div>
        </div>
    );
}

// 2. Wizard Card
const SCHOOL_ICONS: Record<string, any> = {
    'Fire': Flame,
    'Ice': Snowflake,
    'Storm': Zap,
    'Myth': Ghost, 
    'Life': Leaf,
    'Death': Ghost,
    'Balance': Scale
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

function WizardCard({ wizard }: { wizard: Wizard }) {
    const Icon = SCHOOL_ICONS[wizard.school] || Zap;
    const colorClass = SCHOOL_COLORS[wizard.school] || 'text-slate-500 border-slate-500/20 bg-slate-500/10';

    return (
        <Card className="min-w-[280px] border-l-4 overflow-hidden relative group">
            <div className={clsx("absolute left-0 top-0 bottom-0 w-1", colorClass.split(' ')[1])} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Icon className={clsx("w-5 h-5", colorClass.split(' ')[0])} />
                            {wizard.name}
                        </CardTitle>
                        <CardDescription>Level {wizard.level} {wizard.school}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm italic text-muted-foreground line-clamp-2 min-h-[40px]">
                    "{wizard.bio || 'A wizard of mystery...'}"
                </p>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    {wizard.isFriendly && (
                        <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10 hover:bg-green-500/20">
                            <Swords className="w-3 h-3 mr-1" /> Friendly
                        </Badge>
                    )}
                    {wizard.lookingForGuild && (
                        <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20">
                            <Users className="w-3 h-3 mr-1" /> LFG
                        </Badge>
                    )}
                </div>

                {/* Hatching Slots */}
                <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="opacity-70">Hatching Slots</span>
                        <span className="font-mono">{wizard.hatchingSlots} / {wizard.maxHatchingSlots}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-accent-gold transition-all duration-500" 
                            style={{ width: `${(wizard.hatchingSlots / wizard.maxHatchingSlots) * 100}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// 3. Analytics Card (Yearly Scroll)
function AnalyticsCard({ analytics }: { analytics: any }) { 
    if (!analytics) return (
        <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
                <p>No Analytics Data Yet</p>
                <p className="text-xs">Start hatching to fill your scroll!</p>
            </CardContent>
        </Card>
    );

    return (
        <Card className="bg-gradient-to-br from-card to-accent/5 border-none shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScrollArea className="w-5 h-5 text-accent-gold" />
                    The Yearly Scroll
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase">Gold Saved</span>
                    <p className="text-xl font-mono text-yellow-500">
                        ~{((analytics.goldSavedEstimate || 0) / 1000000).toFixed(1)}m
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase">Generosity</span>
                    <p className="text-xl font-mono text-pink-500">
                        {analytics.packsGifted || 0} <span className="text-xs text-muted-foreground">Packs</span>
                    </p>
                </div>
                <div className="col-span-2 space-y-1 pt-2 border-t border-border/10">
                    <span className="text-xs text-muted-foreground uppercase">Most Loyal To</span>
                    <p className="text-sm">
                        Hatched most with <span className="font-bold text-primary">{analytics.mostHatchedSchool || 'Unknown'}</span> Wizards, 
                        especially <span className="italic text-accent-gold">{analytics.topPartner || 'None yet'}</span>.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Main Page ---

export default function ProfilePage() {
    const { profile, wizards, pets, loading, error } = useProfile();
    const { isPending } = useSession();

    // Loading State
    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex gap-6 items-center">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-[200px] w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-[400px] lg:col-span-2" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        );
    }

    // Not Logged In
    if (status === 'unauthenticated' || (!loading && !profile)) {
         return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                 <div className="p-4 bg-accent/10 rounded-full">
                     <Users className="w-12 h-12 text-accent-gold" />
                 </div>
                 <h1 className="text-3xl font-bold font-serif">Join The Commons</h1>
                 <p className="text-muted-foreground max-w-md">
                     Create your wizard profile, track your pets, and build your reputation in the community.
                 </p>
                 <Button onClick={() => signIn.social({ provider: "discord" })} size="lg" className="bg-accent-gold text-primary-foreground hover:bg-accent-gold/90">
                     <LogIn className="w-4 h-4 mr-2" />
                     Sign In / Register
                 </Button>
             </div>
         );
    }

    // Error State
    if (error) {
        return (
            <div className="p-8 text-center text-red-500 border border-red-200 rounded-lg bg-red-50">
                <p>Error loading profile: {error}</p>
            </div>
        );
    }

    // Render Real Profile
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <section className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent-gold shadow-xl bg-background">
                             {/* Fallback image if photoURL is missing/broken */}
                            <img 
                                src={profile?.photoURL || 'https://api.dicebear.com/9.x/notionists/svg?seed=Sorcerer'} 
                                alt={profile?.displayName} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1.5 border shadow-sm">
                           <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-serif tracking-tight">{profile?.displayName}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                             {/* Email hidden for privacy */}
                             <span className="text-sm italic opacity-50">Authorized Wizard</span>
                        </p>
                    </div>
                </div>

                <TrustBadge 
                    hatch={profile?.hatchReputation || 0} 
                    market={profile?.marketReputation || 0} 
                    vouch={profile?.vouchCount || 0} 
                />
            </section>

            <Separator />

            {/* Wizards Gallery */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-serif">Wizards</h2>
                    {wizards.length > 0 && <Badge variant="secondary">{wizards.length} Characters</Badge>}
                </div>
                
                {wizards.length === 0 ? (
                    <div className="p-8 border-dashed border-2 rounded-xl text-center text-muted-foreground">
                        <p>No wizards found.</p>
                        <Button variant="link" className="text-accent-gold">Add a Wizard</Button>
                    </div>
                ) : (
                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <div className="flex w-max space-x-4 p-1">
                            {wizards.map((wiz) => (
                                <WizardCard key={wiz.id} wizard={wiz} />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </section>

            {/* Main Content Grid: Pets & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Pets (The Tome) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold font-serif">My Pets</h2>
                        <div className="flex gap-2">
                             <Badge variant="outline" className="cursor-pointer hover:bg-accent">All</Badge>
                             <Badge variant="outline" className="cursor-pointer hover:bg-accent">Lendable</Badge>
                        </div>
                    </div>

                    {pets.length === 0 ? (
                        <div className="p-12 border-dashed border-2 rounded-xl text-center text-muted-foreground bg-muted/10">
                            <Ghost className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Your Tome is Empty</p>
                            <p className="text-sm">Scan a pet or add one manually to start tracking.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pets.map((pet) => (
                                <Card key={pet.id} className="group hover:border-accent-gold/50 transition-all cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{pet.nickname}</CardTitle>
                                            <Badge variant={pet.isLendable ? "default" : "secondary"} className={pet.isLendable ? "bg-green-500 hover:bg-green-600" : ""}>
                                                {pet.isLendable ? "Lending" : "Private"}
                                            </Badge>
                                        </div>
                                        <CardDescription>{pet.body} • {pet.school}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-1 flex-wrap">
                                            {pet.talents.slice(0, 3).map((t, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                                            ))}
                                            {pet.talents.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">+{pet.talents.length - 3}</Badge>
                                            )}
                                        </div>
                                        {pet.equippedBy && (
                                            <div className="mt-4 pt-2 border-t flex items-center gap-2 text-xs text-muted-foreground">
                                               <Users className="w-3 h-3" />
                                               Carried by {wizards.find(w => w.id === pet.equippedBy)?.name || 'Unknown Wizard'}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Col: Analytics & Bio */}
                <div className="space-y-6">
                    <AnalyticsCard analytics={profile?.analytics} />
                </div>
            </div>
        </div>
    );
}
