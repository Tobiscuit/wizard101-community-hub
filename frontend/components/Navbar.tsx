'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { clsx } from 'clsx';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Calculator', href: '/' },
        { name: 'My Pets', href: '/my-pets' },
        { name: 'Marketplace', href: '/marketplace' },
    ];

    return (
        <nav className="bg-background/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">📖</span>
                            <span className="font-serif font-bold text-xl text-accent-gold">Pet Tome</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        pathname === item.href
                                            ? 'bg-primary/20 text-accent-gold'
                                            : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden md:block">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || 'User'}
                                            className="w-8 h-8 rounded-full border border-white/10"
                                        />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                    <span>{session.user?.name}</span>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-foreground/50 hover:text-red-400 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn()}
                                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-white/5 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={clsx(
                                    'block px-3 py-2 rounded-md text-base font-medium',
                                    pathname === item.href
                                        ? 'bg-primary/20 text-accent-gold'
                                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="border-t border-white/10 my-2 pt-2">
                            {session ? (
                                <>
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        {session.user?.image && (
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || 'User'}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                        <span className="text-foreground">{session.user?.name}</span>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-md"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => signIn()}
                                    className="w-full text-left px-3 py-2 text-accent-gold hover:bg-white/5 rounded-md"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
