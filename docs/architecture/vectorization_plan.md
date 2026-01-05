# Vectorization Strategy: The Knowledge Core 🧠
*Turning 9MB of Raw Text into a Queryable Oracle.*

## 1. Objective
Ingest 80,000+ extracted game entities (Quests, Spells, Items) into a Supabase `pgvector` database to enable Semantic Search for the AI Scribe.

## 2. Database Schema (Supabase)
We will create a specific table `wizard_knowledge` optimized for RAG (Retrieval-Augmented Generation).

```sql
create extension if not exists vector;

create table wizard_knowledge (
  id uuid primary key default gen_random_uuid(),
  
  -- The Core Data
  category text not null,          -- 'quest', 'spell', 'item', 'recipe'
  title text not null,             -- "Fire Cat", "Introduction to Fire"
  content text not null,           -- The full text chunk used for embedding context
  
  -- Metadata for Filtering
  game_id text,                    -- "WizQstFire::001" (Namespaced ID)
  source_file text,                -- "WizQstFire.lang"
  metadata jsonb default '{}',     -- {"school": "fire", "level": 1, "npc": "Bernie"}
  
  -- Security (RBAC)
  access_level text default 'public', -- 'public', 'admin' (for Coordinates/Exploits)
  
  -- The Brain
  embedding vector(768)            -- Optimized for Gemini Text Embeddings
);

-- Indexes for Speed
create index on wizard_knowledge using ivfflat (embedding vector_cosine_ops);
create index on wizard_knowledge (category);
create index on wizard_knowledge (title);
```

## 3. Ingestion Pipeline (`vectorize.py`)
This script will run locally to process `extracted_spells.json`.

### Step A: Intelligent Chunking
Raw lines like `001: Talk to Bernie` are too short. We need **Context Assembly**.
*   **Strategy**: "Quest Aggregation".
*   Rule: Group sequential Quest Lines from the same File/ID block if possible, or just treat the 'Goal' and 'Dialogue' as a combined chunk.
*   **Format**:
    ```text
    Quest: Introduction to Fire
    Goal: Talk to Bernie at the Fire Tree
    Dialogue: "I sense an ember of greatness in you..."
    Context: Fire School, Wizard City
    ```

### Step B: Embedding
*   **Model**: `text-embedding-004` (Gemini) or `text-embedding-3-small` (OpenAI).
*   **Batching**: Process 100 items per request to avoid rate limits.

### Step C: Upsert
*   Use `game_id` as a deduplication key. If `WizQstFire::001` exists, update it; otherwise insert.

## 4. Security Model (RBAC)
*   **Public Access**: All standard Quest, Spell, and Item data.
*   **Admin Access**: Future "Coordinate" or "Logic" data retrieved from the Binary Decoder.
*   The AI Scribe will filter queries: `select * from wizard_knowledge where access_level = 'public' ...`

## 5. Next Steps
1.  [ ] Create `tools/vectorizer/schema.sql`.
2.  [ ] Write `tools/vectorizer/ingest.py`.
3.  [ ] Run the pipeline.
