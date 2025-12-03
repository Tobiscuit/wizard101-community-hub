'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { MagicalLoader } from './MagicalLoader';
import { MagicalButton } from './MagicalButton';

interface ScannedData {
    petNickname?: string;
    petType: string;
    petSchool: string;
    petAge: string;
    currentStats: {
        strength: number;
        intellect: number;
        agility: number;
        will: number;
        power: number;
    };
    maxPossibleStats: {
        strength: number;
        intellect: number;
        agility: number;
        will: number;
        power: number;
    };
    talents: string[];
    confidence: number;
}

interface PetScannerProps {
    onScanComplete: (data: ScannedData) => void;
}

export function PetScanner({ onScanComplete }: PetScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await processImage(file);
    };

    const processImage = async (file: File) => {
        setIsScanning(true);
        setError(null);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async () => {
                const base64Image = reader.result as string;

                const response = await fetch('/api/analyze-pet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image }),
                });

                if (!response.ok) {
                    throw new Error('Failed to analyze image');
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                onScanComplete(data);
            };

            reader.onerror = () => {
                throw new Error('Failed to read file');
            };

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsScanning(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (isScanning) {
        return <MagicalLoader />;
    }

    return (
        <div className="flex flex-col items-center gap-4 mb-8">
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            <div className="flex gap-4">
                <MagicalButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    size="lg"
                    className="min-w-[200px]"
                >
                    <Camera className="w-5 h-5" />
                    Scan Pet
                </MagicalButton>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <p className="text-lg text-accent-gold/80 font-serif italic flex items-center gap-2">
                "Oh, what do we have here?" <span className="text-2xl not-italic">🧙‍♂️</span>
            </p>
        </div>
    );
}
