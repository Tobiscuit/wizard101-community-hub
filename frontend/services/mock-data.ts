
import { Guild, ForumThread, ForumCategory } from "@/types/firestore";

// Helper for timestamps
function ts(minutesAgo: number) {
    const now = Date.now();
    const seconds = Math.floor((now - minutesAgo * 60 * 1000) / 1000);
    return { seconds, nanoseconds: 0, toDate: () => new Date(seconds * 1000) } as any;
}

export const MOCK_GUILDS: Guild[] = [
    {
        id: 'g_ravenwood',
        name: 'The Ravenwood Elite',
        description: 'For honor roll students of the magical arts. Daily raids and hatching events.',
        leaderId: 'bot_ambrose',
        faction: 'Ravenwood',
        memberCount: 1542,
        level: 10,
        tags: ['PVE', 'Raids', 'Social'],
        createdAt: ts(100000),
        updatedAt: ts(10),
    },
    {
        id: 'g_pigswick',
        name: 'Pigswick Academy Rivals',
        description: 'We might not have magic, but we have style. And Tacos.',
        leaderId: 'bot_belladonna',
        faction: 'Pigswick',
        memberCount: 89,
        level: 5,
        tags: ['RP', 'Casual'],
        createdAt: ts(50000),
        updatedAt: ts(100),
    },
    {
        id: 'g_arcanum',
        name: 'Scholars of the Arcanum',
        description: 'Deep theorycrafting and min-maxing only. Level 160+ required.',
        leaderId: 'bot_sybil',
        faction: 'Arcanum',
        memberCount: 300,
        level: 8,
        tags: ['Hardcore', 'Theory', 'PVP'],
        createdAt: ts(20000),
        updatedAt: ts(60),
    },
    {
        id: 'g_death',
        name: 'Nightside Necromancers',
        description: 'Why heal when you can drain? Life wizards DNI.',
        leaderId: 'bot_dworgyn',
        faction: 'Ravenwood',
        memberCount: 666,
        level: 7,
        tags: ['School-Specific', 'PVP'],
        createdAt: ts(80000),
        updatedAt: ts(5),
    },
    {
        id: 'g_grizzle',
        name: 'Bears of Northguard',
        description: 'For the glory of the king!',
        leaderId: 'bot_bjorn',
        faction: 'Grizzleheim',
        memberCount: 120,
        level: 3,
        tags: ['Social', 'Fishing'],
        createdAt: ts(30000),
        updatedAt: ts(200),
    }
];

export const MOCK_THREADS: ForumThread[] = [
    // General
    {
        id: 't_1',
        title: 'Welcome to the new Commons!',
        content: 'I am delighted to welcome you all to this new digital gathering place.',
        authorId: 'bot_ambrose',
        authorName: 'Headmaster Ambrose',
        category: 'general',
        tags: ['Announcement'],
        viewCount: 1000,
        replyCount: 50,
        isPinned: true,
        isLocked: true,
        lastReplyAt: ts(10),
        createdAt: ts(1000),
        updatedAt: ts(1000),
        reactions: { '❤️': 500 }
    },
    {
        id: 't_2',
        title: 'Anyone seen the new Wallaru spells?',
        content: 'They look incredible but the pip cost is insane.',
        authorId: 'bot_gamma',
        authorName: 'Gamma',
        category: 'general',
        tags: ['Discussion', 'Spoilers'],
        viewCount: 250,
        replyCount: 12,
        isPinned: false,
        isLocked: false,
        lastReplyAt: ts(5),
        createdAt: ts(120),
        updatedAt: ts(120),
        reactions: { '🔥': 20 }
    },
    // PVP
    {
        id: 't_3',
        title: 'Myth is broken in current meta',
        content: 'Orthurus needs a nerf. Discuss.',
        authorId: 'bot_cyrus',
        authorName: 'Cyrus Drake',
        category: 'pvp',
        tags: ['Meta', 'Rant'],
        viewCount: 500,
        replyCount: 99,
        isPinned: false,
        isLocked: false,
        lastReplyAt: ts(1),
        createdAt: ts(300),
        updatedAt: ts(300),
        reactions: { '👎': 50, '👍': 10 }
    },
    // Pet Pavilion
    {
        id: 't_4',
        title: 'Hatching Kookaburra with critical talents',
        content: 'I will be in realm Wu area 1 for the next hour.',
        authorId: 'bot_life',
        authorName: 'Moolinda Wu',
        category: 'pet-pavilion',
        tags: ['Hatching', 'Life'],
        viewCount: 45,
        replyCount: 3,
        isPinned: false,
        isLocked: false,
        lastReplyAt: ts(20),
        createdAt: ts(60),
        updatedAt: ts(60),
        reactions: { '🥚': 5 }
    },
    // PVE
    {
        id: 't_5',
        title: 'Guide to Soloing Trident',
        content: 'You definitely need 100% Pierce and a solid strategy.',
        authorId: 'w1',
        authorName: 'Wolf StormBlade',
        category: 'pve',
        tags: ['Guide', 'Difficult'],
        viewCount: 800,
        replyCount: 25,
        isPinned: false,
        isLocked: false,
        lastReplyAt: ts(100),
        createdAt: ts(1000),
        updatedAt: ts(1000),
        reactions: { '⭐': 100 }
    }
];
