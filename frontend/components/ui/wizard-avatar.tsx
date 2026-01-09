"use client";

import React, { useMemo } from 'react';
import { 
    Flame, 
    Snowflake, 
    Zap, 
    Ghost, 
    Leaf, 
    Scale, 
    Skull,
    Wand2 
} from 'lucide-react';
import { clsx } from 'clsx';

type WizardAvatarProps = {
    name?: string | null;
    className?: string;
    school?: string; // Optional override
};

// 🎨 School Themes
const SCHOOLS = [
    { name: 'Fire', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { name: 'Ice', icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { name: 'Storm', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Myth', icon: Ghost, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { name: 'Life', icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { name: 'Death', icon: Skull, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { name: 'Balance', icon: Scale, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
];

export function WizardAvatar({ name, className, school }: WizardAvatarProps) {
    // 🎲 Deterministic Randomness based on Name
    const assignedSchool = useMemo(() => {
        if (school) {
            return SCHOOLS.find(s => s.name.toLowerCase() === school.toLowerCase()) || SCHOOLS[6];
        }
        if (!name) return SCHOOLS[6]; // Default to Balance/Universal if no name

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % SCHOOLS.length;
        return SCHOOLS[index];
    }, [name, school]);

    const Icon = assignedSchool.icon;

    return (
        <div 
            className={clsx(
                "flex items-center justify-center rounded-full overflow-hidden relative",
                assignedSchool.bg,
                className
            )}
            title={`School of ${assignedSchool.name}`}
        >
            {/* Subtle Gradient Overlay */}
            <div className={clsx("absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent to-white")} />
            
            {/* The Icon */}
            <Icon 
                strokeWidth={1.5}
                className={clsx(
                    "w-[50%] h-[50%]", // Icon takes up 50% of the avatar size
                    assignedSchool.color
                )} 
            />
        </div>
    );
}
