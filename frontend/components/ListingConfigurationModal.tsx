'use client';

import React, { useState, useEffect } from 'react';
import { Gem, DollarSign, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { calculateAllPotentials } from '@/lib/talent-formulas';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ListingConfigurationModalProps = {
    pet: any;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: ListingConfig) => void;
    savedDiscordUsername?: string;
    hasDiscordOAuth?: boolean; // If true, user signed in with Discord (no need to ask for username)
};

export type ListingConfig = {
    priceAmount: number;
    priceType: string;
    socketedJewel: string;
    discordUsername: string;
};

const JEWELS = [
    { id: 'none', name: 'No Jewel', bonus: null },
    { id: 'mighty', name: 'Mighty Opal', bonus: { stat: 'strength', amount: 65 } },
    { id: 'thinking_cap', name: 'Thinking Cap Opal', bonus: { stat: 'will', amount: 65 } },
    { id: 'cautious', name: 'Cautious Opal', bonus: { stat: 'agility', amount: 65 } },
    { id: 'brilliant', name: 'Brilliant Opal', bonus: { stat: 'intellect', amount: 65 } },
    { id: 'powerful', name: 'Powerful Opal', bonus: { stat: 'power', amount: 65 } },
];

export function ListingConfigurationModal({ pet, isOpen, onClose, onConfirm, savedDiscordUsername, hasDiscordOAuth }: ListingConfigurationModalProps) {
    const [priceAmount, setPriceAmount] = useState(50);
    const [priceType, setPriceType] = useState('Empowers');
    const [selectedJewel, setSelectedJewel] = useState('none');
    const [discordUsername, setDiscordUsername] = useState(savedDiscordUsername || '');
    const [previewStats, setPreviewStats] = useState<any>(null);

    useEffect(() => {
        if (pet && pet.currentStats) {
            const stats = { ...pet.currentStats };
            const jewel = JEWELS.find(j => j.id === selectedJewel);

            if (jewel && jewel.bonus) {
                stats[jewel.bonus.stat] += jewel.bonus.amount;
            }

            setPreviewStats(calculateAllPotentials(stats));
        }
    }, [pet, selectedJewel]);

    useEffect(() => {
        if (savedDiscordUsername) {
            setDiscordUsername(savedDiscordUsername);
        }
    }, [savedDiscordUsername]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            priceAmount,
            priceType,
            socketedJewel: selectedJewel,
            discordUsername
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md w-full border-accent-gold/20 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif font-bold text-accent-gold flex items-center gap-2">
                        List in Kiosk
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Configure your listing details and price.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Price */}
                    <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            Asking Price
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={priceAmount}
                                onChange={(e) => setPriceAmount(Number(e.target.value))}
                                className="w-24 bg-muted/50 border-input text-foreground focus:border-accent-gold"
                                min="0"
                            />
                            <Select value={priceType} onValueChange={setPriceType}>
                                <SelectTrigger className="flex-1 bg-muted/50 border-input text-foreground focus:ring-accent-gold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Empowers">Empowers</SelectItem>
                                    <SelectItem value="Packs">Packs</SelectItem>
                                    <SelectItem value="Gifting">Gifting</SelectItem>
                                    <SelectItem value="Free">Free (Lending)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Jewel Socketing */}
                    <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2">
                            <Gem className="w-4 h-4 text-purple-500" />
                            Socketed Jewel
                        </Label>
                        <Select value={selectedJewel} onValueChange={setSelectedJewel}>
                             <SelectTrigger className="w-full bg-muted/50 border-input text-foreground focus:ring-accent-gold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {JEWELS.map(j => (
                                    <SelectItem key={j.id} value={j.id}>
                                        {j.name} {j.bonus ? `(+${j.bonus.amount} ${j.bonus.stat})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Stat Preview */}
                        {previewStats && selectedJewel !== 'none' && (
                            <div className="mt-2 p-3 bg-muted/30 rounded border border-border text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>New Damage (Dealer):</span>
                                    <span className="text-green-500 font-mono font-bold">{previewStats.damage.dealer}%</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>New Resist (Proof):</span>
                                    <span className="text-blue-500 font-mono font-bold">{previewStats.resist.proof}%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Discord Contact */}
                    {!hasDiscordOAuth && (
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-blue-500" />
                                Discord Username
                            </Label>
                            <Input
                                type="text"
                                value={discordUsername}
                                onChange={(e) => setDiscordUsername(e.target.value)}
                                placeholder="username"
                                className="w-full bg-muted/50 border-input text-foreground focus:border-accent-gold"
                                required={!hasDiscordOAuth}
                            />
                            <p className="text-xs text-muted-foreground">Required for buyers to contact you.</p>
                        </div>
                    )}

                    {hasDiscordOAuth && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-700 dark:text-green-300">Discord connected - buyers can message you directly!</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-accent-gold text-primary-foreground hover:bg-accent-gold/90"
                        size="lg"
                    >
                        Confirm Listing
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
