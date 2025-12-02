import React from 'react';
import { clsx } from 'clsx';

interface SpellbookProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export function Spellbook({ children, className, title }: SpellbookProps) {
    return (
        <div className={clsx(
            "relative w-full max-w-4xl mx-auto my-8 p-1",
            "bg-accent-gold rounded-lg shadow-2xl",
            "before:absolute before:inset-0.5 before:border-2 before:border-dashed before:border-[#8B4513]/30 before:rounded-lg before:pointer-events-none",
            className
        )}>
            <div className="bg-background rounded-md p-6 min-h-[600px] relative overflow-hidden">
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-accent-gold rounded-tl-xl opacity-50" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent-gold rounded-tr-xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-gold rounded-bl-xl opacity-50" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-accent-gold rounded-br-xl opacity-50" />

                {/* Title */}
                {title && (
                    <div className="text-center mb-8 relative z-10">
                        <h1 className="text-4xl font-serif font-bold text-foreground drop-shadow-md tracking-wider">
                            {title}
                        </h1>
                        <div className="h-1 w-32 bg-accent-gold mx-auto mt-2 rounded-full" />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
