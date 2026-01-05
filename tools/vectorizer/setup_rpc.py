import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing credentials")
    exit(1)

client = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL for Vector Search RPC
rpc_sql = """
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    wizard_knowledge.id,
    wizard_knowledge.content,
    wizard_knowledge.metadata,
    1 - (wizard_knowledge.embedding <=> query_embedding) as similarity
  from wizard_knowledge
  where 1 - (wizard_knowledge.embedding <=> query_embedding) > match_threshold
  order by wizard_knowledge.embedding <=> query_embedding
  limit match_count;
end;
$$;
"""

try:
    # Supabase-py doesn't have a direct 'query' method for raw SQL in the standard client,
    # but the Service Role Key can execute SQL via the REST API pg_meta or we can use the 'rpc' to call a setup function.
    # Actually, Supabase Python client 2.0+ (gotrue/postgrest) is tricky with raw SQL.
    # The standard way to run raw SQL is usually through the Dashboard or a Postgres client.
    # BUT, we can try to call a pre-existing system RPC or just assume the user ran it?
    # User said they "pasted it" implying they might have run schema.sql? 
    # But schema.sql DID NOT HAVE THIS FUNCTION.
    # Let's try to cheat: Use the 'requests' lib to hit the SQL API if enabled, or just...
    # Wait, supabase-py doesn't support raw SQL execution easily.
    
    # OK, Plan B: Notify User to run this SQL.
    # It's safer.
    pass
except Exception as e:
    print(e)
