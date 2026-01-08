"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { Input } from "@/components/ui/input";

interface StatInputCellProps {
    label: string;
    value: number;
    max: number;
    onChange: (newValue: number) => void;
    className?: string;
}

export function StatInputCell({ label, value, max, onChange, className }: StatInputCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleCommit = () => {
        const num = parseInt(inputValue, 10);
        if (!isNaN(num)) {
            // Clamp value
            const clamped = Math.min(Math.max(num, 0), 2000); // Loose upper bound for custom stats, but max usually strictly enforces visually
            onChange(clamped);
        } else {
            setInputValue(value.toString()); // Revert
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleCommit();
        if (e.key === "Escape") {
            setInputValue(value.toString());
            setIsEditing(false);
        }
    };

    // Derived Visual State
    const isMaxed = value >= max;
    const percentage = Math.min(100, (value / max) * 100);

    return (
        <motion.div 
            layout 
            className={clsx(
                "relative flex flex-col justify-center px-4 py-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-colors overflow-hidden group cursor-pointer h-20",
                isEditing ? "ring-2 ring-accent-gold/50 border-accent-gold/50 bg-background/80 z-10" : "hover:bg-accent-gold/5 hover:border-accent-gold/30",
                className
            )}
            onClick={() => !isEditing && setIsEditing(true)}
        >
            {/* Background Progress Bar (Subtle) */}
            <div 
                className="absolute bottom-0 left-0 h-1 bg-accent-gold/20 transition-all duration-500" 
                style={{ width: `${percentage}%` }}
            />
            {isMaxed && !isEditing && (
                 <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-accent-gold/0 via-accent-gold/50 to-accent-gold/0 animate-shimmer" />
            )}

            <div className="flex justify-between items-baseline select-none">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                {/* Max Label */}
                <span className="text-[10px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    Max: {max}
                </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleCommit}
                        onKeyDown={handleKeyDown}
                        className="h-8 p-0 text-2xl font-bold font-serif border-none bg-transparent focus-visible:ring-0 shadow-none"
                    />
                ) : (
                    <motion.div layoutId={`val-${label}`} className="flex items-baseline gap-1">
                        <span className={clsx("text-2xl font-bold font-serif tabular-nums transition-colors", isMaxed ? "text-accent-gold" : "text-foreground")}>
                            {value}
                        </span>
                        <span className="text-xs text-muted-foreground/50 font-medium">/ {max}</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
