'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { clsx } from 'clsx';

const LOADING_PHRASES = [
    "Consulting the Oracle...",
    "Reading Pet Pedigree...",
    "Calculating Manifestation Rates...",
    "Deciphering Ancient Runes...",
    "Summoning Pet Stats...",
    "Checking Talent Pool...",
    "Measuring Will & Power...",
    "Scanning for Meta Talents..."
];

export function MagicalLoader() {
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-[#1a1a2e] border-2 border-accent-gold p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4 text-center overflow-hidden">
                {/* Magical Glow Effects */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent animate-pulse" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent animate-pulse" />

                {/* Animated Icon */}
                <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-accent-blue/30 blur-xl rounded-full animate-pulse" />
                    <Sparkles className="w-16 h-16 text-accent-gold animate-spin-slow relative z-10" />
                    <Star className="w-6 h-6 text-yellow-300 absolute top-0 right-0 animate-bounce" />
                    <Star className="w-4 h-4 text-yellow-300 absolute bottom-0 left-0 animate-ping" />
                </div>

                {/* Shifting Text */}
                <h3 className="text-xl font-serif font-bold text-white mb-2 min-h-[3rem] flex items-center justify-center transition-all duration-500">
                    {LOADING_PHRASES[phraseIndex]}
                </h3>

                <p className="text-sm text-white/60 italic">
                    Please wait while the magic happens...
                </p>
            </div>
        </div>
    );
}
