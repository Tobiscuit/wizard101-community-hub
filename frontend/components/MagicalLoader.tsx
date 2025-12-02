'use client';

import React, { useState, useEffect } from 'react';
import {
    TreeDeciduous, // Bartleby
    Scroll,        // Runes
    Cookie,        // Snacks
    Egg,           // Hatching
    Search,        // Scanning
    Ghost,         // Spirit
    Dna,           // Genetics
    Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

const LOADER_SCENES = [
    {
        text: "Consulting Bartleby...",
        icon: TreeDeciduous,
        color: "text-green-600",
        bg: "bg-green-100/50",
        borderColor: "border-green-500"
    },
    {
        text: "Deciphering Ancient Runes...",
        icon: Scroll,
        color: "text-amber-700",
        bg: "bg-amber-100/50",
        borderColor: "border-amber-600"
    },
    {
        text: "Mixing Pet Snacks...",
        icon: Cookie,
        color: "text-orange-500",
        bg: "bg-orange-100/50",
        borderColor: "border-orange-400"
    },
    {
        text: "Checking Hatching Timer...",
        icon: Egg,
        color: "text-blue-500",
        bg: "bg-blue-100/50",
        borderColor: "border-blue-400"
    },
    {
        text: "Scanning for Talents...",
        icon: Search,
        color: "text-purple-600",
        bg: "bg-purple-100/50",
        borderColor: "border-purple-500"
    },
    {
        text: "Summoning Pet Spirit...",
        icon: Ghost,
        color: "text-cyan-500",
        bg: "bg-cyan-100/50",
        borderColor: "border-cyan-400"
    },
    {
        text: "Unlocking Genetic Potential...",
        icon: Dna,
        color: "text-pink-500",
        bg: "bg-pink-100/50",
        borderColor: "border-pink-400"
    }
];

export function MagicalLoader() {
    const [sceneIndex, setSceneIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSceneIndex((prev) => (prev + 1) % LOADER_SCENES.length);
        }, 2000); // Change scene every 2 seconds

        return () => clearInterval(interval);
    }, []);

    const currentScene = LOADER_SCENES[sceneIndex];
    const Icon = currentScene.icon;

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
            {/* Magical Portal Container */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer Rune Ring */}
                <div className={clsx(
                    "absolute inset-0 border-4 border-dashed rounded-full animate-[spin_10s_linear_infinite]",
                    currentScene.borderColor,
                    "opacity-40"
                )} />

                {/* Inner Energy Ring */}
                <div className={clsx(
                    "absolute inset-3 border-4 border-dotted rounded-full animate-[spin_8s_linear_infinite_reverse]",
                    currentScene.borderColor,
                    "opacity-60"
                )} />

                {/* Core Icon Container */}
                <div className={clsx(
                    "relative z-10 w-20 h-20 rounded-full flex items-center justify-center",
                    "backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.1)]",
                    "transition-colors duration-500",
                    currentScene.bg,
                    "border-2",
                    currentScene.borderColor
                )}>
                    <Icon className={clsx(
                        "w-10 h-10 transition-all duration-500 transform",
                        currentScene.color,
                        "animate-pulse"
                    )} />
                </div>

                {/* Floating Particles */}
                <Sparkles className={clsx(
                    "absolute -top-4 -right-4 w-6 h-6 animate-bounce delay-100",
                    currentScene.color
                )} />
                <Sparkles className={clsx(
                    "absolute -bottom-4 -left-4 w-5 h-5 animate-bounce delay-300",
                    currentScene.color
                )} />
            </div>

            {/* Text Animation */}
            <div className="h-8 relative overflow-hidden w-full text-center">
                <p
                    key={sceneIndex} // Key forces re-render for animation
                    className={clsx(
                        "text-xl font-serif font-bold animate-[slideUp_0.5s_ease-out_forwards]",
                        currentScene.color
                    )}
                >
                    {currentScene.text}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-black/10 rounded-full overflow-hidden">
                <div className={clsx(
                    "h-full w-full animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]",
                    "bg-gradient-to-r from-transparent via-current to-transparent",
                    currentScene.color
                )} />
            </div>
        </div>
    );
}
