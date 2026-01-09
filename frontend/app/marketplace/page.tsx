"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { getListings, createListing, createOrder } from "@/services/marketplace-service";
import { MarketplaceListing } from "@/types/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Coins, Package, Info, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MarketplacePage() {
    const { data: session } = useSession();
    const router = useRouter();
    
    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create State
    const [isOpen, setIsOpen] = useState(false);
    const [newItem, setNewItem] = useState<Partial<MarketplaceListing>>({ type: 'tc_pack', currency: 'empowers' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadListings();
    }, []);

    const [error, setError] = useState<string | null>(null);

    async function loadListings() {
        setLoading(true);
        setError(null);
        try {
            const data = await getListings();
            setListings(data);
        } catch (err: any) {
            console.error("Marketplace Load Error:", err);
            if (err.message.includes("requires an index")) {
               setError("System is building indexes. Please wait 2-5 minutes and refresh.");
            } else {
               setError(err.message || "Failed to load listings");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!session?.user?.id) return;
        setCreating(true);
        try {
            await createListing(session.user.id, session.user.name || 'Unknown', newItem);
            setIsOpen(false);
            loadListings();
        } catch (e) {
            console.error(e);
            alert("Error creating listing");
        } finally {
            setCreating(false);
        }
    }

    async function handleBuy(listing: MarketplaceListing) {
        if (!session?.user?.id) return alert("Login to buy");
        if (confirm(`Send a Ping to buy ${listing.title} for ${listing.pricePerBatch || listing.pricePerUnit} Empowers?`)) {
            try {
                // Assuming buying 1 batch for simplicity
                await createOrder(listing, session.user.id, 1);
                alert("Ping sent! Check your Order Dashboard.");
                router.refresh();
            } catch (e) {
                console.error(e); // alert("Failed");
            }
        } 
    }

    return (
        <div className="container py-10 animate-in fade-in duration-500">
             {error && (
                <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 rounded-xl text-red-500 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    <p>{error}</p>
                </div>
             )}
             <div className="flex justify-between items-center mb-10">
                <div>
                     <h1 className="text-4xl font-serif font-bold flex items-center gap-3">
                        <Coins className="w-10 h-10 text-yellow-500" />
                        Marketplace
                     </h1>
                     <p className="text-muted-foreground">Peer-to-peer trading. Powered by Empowers.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                         <Button className="bg-accent-gold text-primary-foreground hover:bg-accent-gold/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Sell Item
                         </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>List an Item</DialogTitle>
                            <DialogDescription>What are you selling today?</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select 
                                        value={newItem.type} 
                                        onValueChange={(v: any) => setNewItem({...newItem, type: v})}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tc_pack">TC Pack (Simple)</SelectItem>
                                            <SelectItem value="pet_lend">Pet Lend</SelectItem>
                                            <SelectItem value="carry_service">Carry Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select disabled value="empowers">
                                        <SelectTrigger><SelectValue placeholder="Empowers" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="empowers">Empowers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Item Name</Label>
                                <Input 
                                    placeholder="e.g. 999x Azoth or 'Max Stat Storm Pet'" 
                                    value={newItem.title || ''}
                                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Batch Size</Label>
                                    <Input 
                                        type="number" 
                                        value={newItem.batchSize || 1}
                                        onChange={e => setNewItem({...newItem, batchSize: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price (Total)</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="Amount in Empowers"
                                        value={newItem.pricePerBatch || ''}
                                        onChange={e => setNewItem({...newItem, pricePerBatch: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={creating} className="bg-accent-gold text-primary-foreground hover:bg-accent-gold/90">
                                {creating ? "Listing..." : "Post Listing"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map(item => (
                    <Card key={item.id} className="group hover:border-accent-gold/50 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="capitalize">{item.type.replace('_', ' ')}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {item.createdAt ? new Date((item.createdAt as any).seconds * 1000).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            <CardTitle className="text-lg mt-2 truncate">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground pb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4" />
                                <span>Batch: {item.batchSize}x</span>
                            </div>
                            <div className="font-mono text-primary font-bold text-lg flex items-center gap-2">
                                {item.pricePerBatch} <span className="text-xs text-muted-foreground font-sans font-normal">Empowers</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleBuy(item)}>
                                Ping to Buy
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
             </div>
        </div>
    );
}
