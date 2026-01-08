'use client';

import React from 'react';
import { signIn } from '@/lib/auth-client';
import { GridPattern } from "@/components/magicui/grid-pattern"
import { MagicCard } from "@/components/magicui/magic-card"
import { MessageCircle, Shield } from 'lucide-react';
import { clsx } from 'clsx';

export default function LoginPage() {
    const handleLogin = async (provider: 'discord' | 'google') => {
        await signIn.social({
            provider,
            callbackURL: '/profile'
        });
    };

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 overflow-hidden">
             <GridPattern
                width={30}
                height={30}
                x={-1}
                y={-1}
                className="stroke-gray-400/20 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
                strokeDasharray="4 2"
            />
            
            <MagicCard 
                className="w-full max-w-sm h-fit p-8 border-accent-gold/20 shadow-2xl relative overflow-visible z-10"
                gradientColor="#FFD700" 
                gradientOpacity={0.1}
            >
                <div className="text-center mb-8">
                     <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground drop-shadow-md mb-2">
                        Identify <span className="text-accent-gold">Yourself</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Reveal your identity to access the Tome.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Discord Button (Recommended) */}
                    <div className="relative">
                        <div className="absolute -top-2.5 right-4 bg-accent-gold text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20 pointer-events-none uppercase tracking-wider">
                            Recommended
                        </div>
                        <button
                            onClick={() => handleLogin('discord')}
                            className={clsx(
                                "relative w-full flex items-center gap-4 p-4 rounded-lg transition-all border",
                                "bg-background/50 hover:bg-accent-gold/10 border-accent-gold/20 hover:border-accent-gold/50",
                                "group"
                            )}
                        >
                            <div className="p-2 bg-foreground/5 rounded-md group-hover:bg-accent-gold/20 transition-colors">
                                <MessageCircle className="w-5 h-5 text-foreground group-hover:text-accent-gold" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-bold text-base text-foreground group-hover:text-accent-gold transition-colors">Discord</div>
                                <div className="text-xs text-muted-foreground">Direct DMs for Hatching</div>
                            </div>
                        </button>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={() => handleLogin('google')}
                        className={clsx(
                            "w-full flex items-center gap-4 p-4 rounded-lg transition-all border",
                             "bg-background/50 hover:bg-white/10 border-white/10 hover:border-white/30",
                             "group"
                        )}
                    >
                         <div className="p-2 bg-foreground/5 rounded-md group-hover:bg-white/20 transition-colors">
                            <Shield className="w-5 h-5 text-foreground group-hover:text-white" />
                        </div>
                        <div className="text-left flex-1">
                            <div className="font-bold text-base text-foreground group-hover:text-white transition-colors">Google</div>
                            <div className="text-xs text-muted-foreground">Standard access</div>
                        </div>
                    </button>
                </div>

                <div className="mt-8 text-center text-xs text-muted-foreground/50 px-4">
                    <p className="italic">
                        "Wizards who login with Discord find 50% more hatching partners."
                        <br />
                        - Gamma
                    </p>
                </div>
            </MagicCard>
        </div>
    );
}
