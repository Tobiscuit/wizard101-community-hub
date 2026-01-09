export type Stats = {
    strength: number;
    intellect: number;
    agility: number;
    will: number;
    power: number;
};

export function calculateTalentValue(talentName: string, stats: Stats): string | null {
    const name = talentName.toLowerCase();
    const { strength, will, power, agility } = stats;

    // Base Calculation Variables
    // Damage/Punch: (2*Str + 2*Will + Power)
    const damageBase = (2 * strength + 2 * will + power);

    // Resist/Ward: (2*Str + 2*Agi + Power)
    const resistBase = (2 * strength + 2 * agility + power);

    // Critical: (2*Agi + 2*Will + Power)
    // const critBase = (2 * agility + 2 * will + power);

    let value = 0;

    // Damage Talents
    if (name.includes("dealer")) {
        value = (damageBase * 3) / 400;
    } else if (name.includes("giver") || name.includes("pain-giver")) {
        value = (damageBase * 1) / 200; // Equivalent to 2/400
    } else if (name.includes("boon") || name.includes("bringer") || name.includes("pain-bringer")) {
        value = (damageBase * 1) / 400;
    }

    // Resist Talents
    else if (name.includes("proof") || name.includes("spell-proof")) {
        value = resistBase / 125; // Equivalent to 3.2/400 roughly? No, Proof is ~10% max. (2*255 + 2*260 + 250)/125 = 10.24
    } else if (name.includes("defy") || name.includes("spell-defying")) {
        value = resistBase / 250; // Half of proof
    }

    // Pierce (simplified)
    else if (name.includes("pierce") || name.includes("armor breaker")) {
        // Breaker is usually around 3-4%
        // Formula is roughly (2*Str + 2*Agi + Power) / 400
        value = resistBase / 400;
    }

    // Selfish Talents (Stat Boosts)
    // Tier 1 (+65)
    else if (name === 'mighty') return 'STR+65';
    else if (name === 'thinking cap') return 'WILL+65';
    else if (name === 'relentless') return 'AGI+65';
    else if (name === 'brilliant') return 'INT+65';
    else if (name === 'powerful') return 'POW+65';

    // Tier 2 (+40/+25)
    else if (name === 'best of show') return 'STR+40, INT+25';
    else if (name === 'cautious') return 'STR+25, WILL+40';
    else if (name === 'unshakable') return 'STR+40, AGI+25';
    else if (name === 'vigorous') return 'STR+25, POW+40';
    else if (name === 'early bird') return 'AGI+40, WILL+25';
    else if (name === 'resourceful') return 'INT+40, POW+25';
    else if (name === 'perceptive') return 'INT+40, WILL+25'; // Assuming standard 40/25 split

    if (value > 0) {
        return `${Math.round(value)}%`;
    }

    return null;
}

export function calculateAllPotentials(stats: Stats) {
    const { strength, will, power, agility, intellect } = stats;

    // Base Variables
    const damageBase = (2 * strength + 2 * will + power);
    const resistBase = (2 * strength + 2 * agility + power);
    const accuracyBase = (2 * intellect + 2 * agility + power);
    const pipsBase = (2 * strength + 2 * intellect + power);
    const critBase = (2 * agility + 2 * will + power);
    // Healing usually tracks Damage (Str/Will/Pow)
    const healBase = damageBase; 
    // Stun Resist usually tracks Resist (Str/Agi/Pow)
    const stunBase = resistBase;

    return {
        damage: {
            dealer: Math.round((damageBase * 3) / 400), // ~10-11%
            giver: Math.round((damageBase * 1) / 200),  // ~6-7%
            boon: Math.round((damageBase * 1) / 400),   // ~3-4%
        },
        resist: {
            proof: Math.round(resistBase / 125),        // ~10-11%
            defy: Math.round(resistBase / 250),         // ~5-6%
            ward: Math.round(resistBase / 80),          // ~15%
        },
        pierce: {
            breaker: Math.round(resistBase / 400),      // ~3-4%
            piercer: Math.round(resistBase / 600),      // ~2-3%
        },
        accuracy: {
            sniper: Math.round((accuracyBase * 3) / 400), // ~9-10%
            sharp: Math.round((accuracyBase * 1) / 200),  // ~6%
            shot: Math.round((accuracyBase * 1) / 400),   // ~3%
        },
        pips: {
            plenty: Math.round(pipsBase / 250),           // ~5%
        },
        critical: {
            striker: Math.round(critBase / 50),          // Rating
            hitter: Math.round(critBase / 60),           // Rating
        },
        block: {
            defender: Math.round(critBase / 40),         // Rating
            blocker: Math.round(critBase / 50),          // Rating
        },
        healing: {
            medic: Math.round((healBase * 1) / 150),     // ~8%
            healer: Math.round((healBase * 1) / 200),    // ~6%
        },
        stun: {
            recalcitrant: Math.round(stunBase / 125),    // ~10%
        }
    };
}

export const JEWEL_BONUSES: Record<string, { stat: keyof Stats, amount: number }> = {
    'mighty': { stat: 'strength', amount: 65 },
    'thinking_cap': { stat: 'will', amount: 65 },
    'cautious': { stat: 'agility', amount: 65 },
    'brilliant': { stat: 'intellect', amount: 65 },
    'powerful': { stat: 'power', amount: 65 }
};

export function applyJewelBonus(stats: Stats, jewelId?: string): Stats {
    if (!jewelId || !JEWEL_BONUSES[jewelId]) return stats;

    const bonus = JEWEL_BONUSES[jewelId];
    return {
        ...stats,
        [bonus.stat]: (stats[bonus.stat] || 0) + bonus.amount
    };
}
