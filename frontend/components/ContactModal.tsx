'use client';

import React from 'react';
import { X, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: any;
    currentUserId?: string;
}

export function ContactModal({ isOpen, onClose, listing, currentUserId }: ContactModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !listing) return null;

    const isOwnPet = currentUserId === listing.userId;
    const contact = listing.ownerContact || {};
    // Check if the "discord" field looks like an email (legacy/fallback behavior)
    const isEmail = contact.discord && contact.discord.includes('@');
    const discordId = contact.discordUserId;
    const contactValue = contact.discord || contact.email;

    const handleCopy = () => {
        navigator.clipboard.writeText(contactValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDiscordRedirect = () => {
        if (discordId) {
            window.open(`https://discord.com/users/${discordId}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a2e] border-2 border-accent-gold rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
                {/* Header */}
                <div className="bg-black/40 p-4 border-b border-accent-gold/30 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-accent-gold">
                        Request Hatch
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-gold/30">
                            {isOwnPet ? (
                                <span className="text-3xl">🧙‍♂️</span>
                            ) : (
                                <MessageCircle className="w-8 h-8 text-accent-gold" />
                            )}
                        </div>

                        <h4 className="text-lg font-bold text-white mb-1">
                            {isOwnPet ? "This is your pet!" : listing.petType}
                        </h4>
                        <p className="text-sm text-white/60">
                            {isOwnPet
                                ? "You cannot request a hatch with yourself."
                                : `Owned by ${listing.ownerDisplayName}`}
                        </p>
                    </div>

                    {!isOwnPet && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
                                Contact Method
                            </label>

                            {discordId ? (
                                <button
                                    onClick={handleDiscordRedirect}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors font-bold"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Open Discord DM
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-white/80 bg-black/20 p-3 rounded border border-white/5 break-all">
                                        {isEmail ? <Mail className="w-4 h-4 shrink-0" /> : <MessageCircle className="w-4 h-4 shrink-0" />}
                                        <span>{contactValue}</span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={clsx(
                                            "w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium",
                                            copied
                                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                        )}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "Copied!" : "Copy Contact Info"}
                                    </button>
                                    {isEmail && (
                                        <p className="text-xs text-center text-white/40 mt-2">
                                            This wizard is using email login.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {isOwnPet && (
                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
