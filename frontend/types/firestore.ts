import { Timestamp } from 'firebase/firestore';

export type UserProfile = {
    uid: string;
    displayName: string; // Searchable
    email?: string; // Private
    photoURL?: string;
    mainWizardId?: string; // ID of the wizard to display on the profile card
    hatchReputation: number; // Tier 1: Logarithmic Verified Hatches
    marketReputation: number; // Tier 2: Empower Market
    vouchCount: number; // Tier 3: Manual Reviews
    accountStatus?: 'active' | 'restricted' | 'banned';
    theme?: 'light' | 'dark' | 'candlelight' | 'abyss';
    
    // Analytics ("The Yearly Scroll")
    analytics?: {
        totalHatches: number;
        empowersEarned: number;
        empowersSpent: number;
        packsGifted: number; // "Generosity"
        mostHatchedSchool: string; // "Storm"
        favoritePetBody: string; // "Snappy Gryphon"
        goldSavedEstimate: number; // "You saved ~2m Gold by not using Kiosk!"
        topPartner?: string; // "Hatches with Wolf StormBlade: 5"
    };

    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type Transaction = {
    id: string;
    participants: string[]; // [uid_sender, uid_receiver]
    type: 'hatch_lend' | 'market_trade';
    items: {
        id: 'empower' | 'energy_elixir' | 'hatching_elixir' | 'crowns' | 'other';
        count: number;
    }[];
    status: 'pending' | 'completed' | 'cancelled';
    timestamp: Timestamp;
};

export type Wizard = {
    id: string; // Auto-ID
    userId: string; // Parent User ID
    name: string; // "Wolf StormBlade"
    school: 'Fire' | 'Ice' | 'Storm' | 'Myth' | 'Life' | 'Death' | 'Balance';
    level: number; // 1 - 180 (Darkmoor Cap)
    bio?: string;
    
    // Social / LFG Flags
    isFriendly: boolean; // "Team Up" / Challenge Mode
    lookingForGuild: boolean; // Recruitment
    
    // Hatching Logic
    hatchingSlots: number; // Current slots available
    maxHatchingSlots: number; // Calculated based on level (e.g., Lvl 170+ = 4)
    nextHatchTimer?: Timestamp; // When the next slot opens

    // Verification (Universal)
    verifiedStats?: {
        damage: number;
        resist: number;
        pierce: number;
        accuracy: number;
        powerPip: number;
        archmastery: number;
    };
    lastVerifiedAt?: Timestamp;
    isStatsPublic: boolean; // "Hidden or Public"
};

export type Pet = {
    id: string;
    userId: string; // Owner (Account)
    
    // Core Identity
    nickname: string; // "Prince Sassy"
    body: string; // "Rain Core" (Species)
    school: string; // "Storm"
    
    // Stats (0-255)
    stats: {
        strength: number;
        intellect: number;
        agility: number;
        will: number;
        power: number;
    };
    
    // Talents (List of 5 manifest)
    talents: string[]; 
    
    // Location / Status
    equippedBy?: string; // wizardId (Optional). If null, it's in Shared Bank.
    isLendable: boolean; // "Kiosk" mode (Accepting hatch requests)
};

// --- Phase 3: Community Features ---

export type MercenaryProfile = {
    wizardId: string; // PK (Same as Wizard ID)
    userId: string;
    
    // Stats are now pulled from the linked Wizard Document
    
    // Social / Reputation
    badges: {
        [key: string]: number; // e.g. { 'quick': 10, 'efficient': 5 }
    };
    totalRuns: number;
    pricePerRun: string; // "50 Empowers"
    
    enabled: boolean; // Toggle listing without deleting
};

export type Guild = {
    id: string;
    name: string;
    description: string;
    leaderId: string; // User UID
    
    // Identity
    faction: 'ravenwood' | 'pigswick' | 'arcanum';
    level: number;
    tags: string[]; // ["Raiding", "PVP"]
    
    // Metadata
    memberCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type MarketplaceListing = {
    id: string;
    sellerId: string;
    sellerName: string; // Snapshot for UI speed
    
    // Item Details
    type: 'tc_pack' | 'pet_lend' | 'carry_service';
    title: string; // "999x Empower TC"
    description: string;
    
    // Quantity logic
    batchSize: number; // 999
    availableBatches: number; // 5
    allowPartial: boolean; // Can I buy 50?
    
    // Pricing
    currency: 'empowers' | 'packs' | 'keys'; // Primary currency
    pricePerUnit?: number; // If allowPartial is true
    pricePerBatch?: number; // If allowPartial is false
    
    status: 'active' | 'sold' | 'expired';
    createdAt: Timestamp;
};

export type MarketOrder = {
    id: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    
    amount: number; // How many items/batches
    totalPrice: number; // Calculated
    currency: string;
    
    // Ping Lifecycle
    status: 'pending' | 'busy' | 'scheduled' | 'processing' | 'completed' | 'cancelled' | 'expired';
    
    // Scheduling
    proposedTime?: Timestamp; // If busy, when?
    scheduledTime?: Timestamp; // Confirmed time
    expiresAt?: Timestamp; // 15m timer after 'processing' starts
    
    // Quick Chat (System Messages)
    history: {
        senderId: string; // 'system' or userId
        text: string;
        timestamp: Timestamp;
    }[];
    
    createdAt: Timestamp;
};

// --- Phase 4: Olde Town (Forums) ---

export type ForumCategory = 'General' | 'PVP' | 'PVE' | 'Pet Pavilion' | 'Feedback';

export type ForumThread = {
    id: string;
    authorId: string;
    authorName: string; // Snapshot
    authorWizardId?: string; // Optional context: "Posting as Wolf StormBlade"
    
    category: ForumCategory;
    title: string;
    content: string; // Markdown
    
    // Attachments (Asset-First)
    attachedAsset?: {
        type: 'wizard' | 'pet' | 'item';
        id: string;
        snapshot: any; // visual data (e.g. Pet talents, Wizard stats) for permanent context
    };

    tags: string[]; // ["Darkmoor", "Strategy"]
    
    // Metrics
    viewCount: number;
    replyCount: number;
    lastReplyAt: Timestamp;
    lastReplyAuthorName?: string;
    
    isPinned: boolean;
    isLocked: boolean;
    
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type ForumPost = {
    id: string;
    threadId: string;
    authorId: string;
    authorName: string;
    authorWizardId?: string; // "Replying as..."
    
    content: string; // Markdown
    
    createdAt: Timestamp;
    updatedAt: Timestamp;
    
    // Likes/Reactions
    reactions?: {
        [emoji: string]: number; // "🔥": 5
    };
};
