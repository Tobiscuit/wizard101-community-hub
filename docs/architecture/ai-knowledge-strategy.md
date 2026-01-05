# Hybrid AI Knowledge Architecture

## The Challenge
Players ask two types of questions:
1.  **Fact-Based**: "How much damage does Fire Cat do?" (Source: Game Code)
2.  **Strategy-Based**: "How do I beat Malistaire?" (Source: Community/Wiki)

Game files (`.wad`) contain **Facts** but *lack* **Strategy** (the "Cheats" are often scripted logic, not readable text).
The Wiki contains **Strategy** but is slow/ad-heavy.

## The Solution: "Twin-Engine" AI

### 1. The Left Brain (Local DB)
*   **Source**: Extracted WAD files (`Root`, `Mob`, `TC`).
*   **Format**: JSON/Vector DB (Supabase).
*   **Role**: Instant, 100% accurate answers for Stats, Drops, and Item Locations.
*   **Example**: "Fire Cat is a Rank 1 Spell, 80-120 Damage, 70% Accuracy."

### 2. The Right Brain (Search Grounding)
*   **Source**: Google Search / Wiki.
*   **Format**: Live RAG.
*   **Role**: Human-written guides, cheat explanations, and deck setups.
*   **Example**: "To beat Malistaire, carry frequent dispels and kill the minions first."

## Workflow
1.  **User asks**: "How to beat Malistaire?"
2.  **AI Query DB**: Finds "Malistaire the Undying" (ID 5001, HP 100k, Rank 15).
3.  **AI Query Web**: Searches "Malistaire the Undying Cheats Guide 2025".
4.  **Synthesis**: "Malistaire (100k HP) has a cheat where he respawns. The files show he is Shadow School. Recommended strategy is..."

## Technology Stack
*   **Vectors**: Supabase `pgvector` (Stores extracted Game Entities).
*   **LLM**: Gemini 3.0 (Primary) or Llama 3 (Hibernate Fallback).
*   **Orchestrator**: `scribe.ts` determines if the question is "Fact" (DB) or "Strategy" (Web).
