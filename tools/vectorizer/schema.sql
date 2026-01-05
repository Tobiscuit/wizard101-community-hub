-- Enable the Vector extension
create extension if not exists vector;

-- The Master Knowledge Table
create table if not exists wizard_knowledge (
  id uuid primary key default gen_random_uuid(),
  
  -- Core Content
  category text not null,          -- 'quest', 'spell', 'item', 'recipe'
  title text not null,             -- "Fire Cat", "Introduction to Fire"
  content text not null,           -- Full context for embedding
  
  -- Metadata
  game_id text,                    -- "WizQstFire::001"
  source_file text,                -- "WizQstFire.lang"
  metadata jsonb default '{}',     -- Extra data (Level, School, NPC)
  
  -- Security
  access_level text default 'public', -- 'public' vs 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- The Embedding (768 dimensions for Gemini Text-Embedding-004)
  embedding vector(768)
);

-- Indexes for Speed
-- IVFFlat index for fast approximate nearest neighbor search
-- Lists = Rows / 1000 is a good rule of thumb. For 80k rows, lists=80 or 100.
create index on wizard_knowledge using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Metadata indexes for standard filtering
create index idx_wiz_category on wizard_knowledge(category);
create index idx_wiz_game_id on wizard_knowledge(game_id);
create index idx_wiz_title on wizard_knowledge(title);
