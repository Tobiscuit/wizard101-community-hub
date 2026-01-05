import os
import json
import time
from typing import List, Dict
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai
from tqdm import tqdm

# Load Env
load_dotenv()

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class WizVectorizer:
    """
    The Alchemist.
    Transmutes Raw Text (JSON) into Semantic Gold (Vectors).
    Uses the modern google-genai SDK.
    """
    def __init__(self, json_path: str):
        self.json_path = json_path
        self.client: Client = None
        self.ai_client: genai.Client = None
        self.data_store = {}
        
    def connect_db(self):
        """Connects to Supabase."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        self.client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(" > Connected to Supabase.")

    def connect_ai(self):
        """Connects to Gemini Embedding Model."""
        if not GEMINI_API_KEY:
            raise ValueError("Missing GEMINI_API_KEY in .env")
        # Modern Client Initialization
        self.ai_client = genai.Client(api_key=GEMINI_API_KEY)
        print(" > Connected to Gemini AI (google-genai v1+).")

    def load_data(self):
        """Loads the extracted_spells.json."""
        with open(self.json_path, 'r') as f:
            raw = json.load(f)
            self.data_store = raw.get("data", {})
        print(f" > Loaded Knowledge Base. Categories: {list(self.data_store.keys())}")

    def chunk_quests(self) -> List[Dict]:
        """
        Intelligent Chunking for Quests.
        Merges Name + ID into a search context.
        """
        chunks = []
        quests = self.data_store.get("Quests", {})
        
        print(f" > Processing {len(quests)} Quests...")
        for q_id, q_text in tqdm(quests.items(), desc="Chunking Quests"):
            # Clean text
            clean_text = q_text.strip()
            if len(clean_text) < 5: continue 
            
            chunk = {
                "category": "quest",
                "title": clean_text[:50] + "...",
                "content": f"Quest Text: {clean_text}\nQuest ID: {q_id}",
                "game_id": q_id,
                "source_file": q_id.split("::")[0] if "::" in q_id else "unknown",
                "metadata": {"type": "dialogue"}
            }
            chunks.append(chunk)
            
        print(f" > Generated {len(chunks)} chunks.")
        return chunks

    def embed_and_upsert(self, chunks: List[Dict], batch_size=50):
        """
        Generates embeddings and pushes to Supabase in batches.
        """
        total = len(chunks)
        print(f" > Starting Ingestion of {total} vectors...")
        
        for i in range(0, total, batch_size):
            batch = chunks[i : i+batch_size]
            texts = [c["content"] for c in batch]
            
            try:
                # 1. Embed (Batch) using Modern SDK
                # Response format: object with .embeddings attribute
                response = self.ai_client.models.embed_content(
                    model="text-embedding-004",
                    contents=texts
                )
                
                # Each embedding in response.embeddings has a .values attribute (list of floats)
                
                # 2. Upsert to Supabase
                rows_to_insert = []
                for j, doc in enumerate(batch):
                    # Check if response acts like a list or object
                    if hasattr(response, 'embeddings'):
                        embedding_vector = response.embeddings[j].values
                    else:
                         # Fallback for older API shape if needed, but SDK v1 uses .embeddings
                        embedding_vector = response[j]

                    doc["embedding"] = embedding_vector
                    rows_to_insert.append(doc)
                
                # Supabase Upsert
                self.client.table("wizard_knowledge").upsert(rows_to_insert).execute()
                
            except Exception as e:
                print(f"Error in batch {i}: {e}")
                time.sleep(2) # Backoff

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    JSON_FILE = os.path.join(current_dir, "../wizwad/extracted_spells.json")
    
    vectorizer = WizVectorizer(JSON_FILE)
    
    try:
        vectorizer.load_data()
        vectorizer.connect_db() 
        vectorizer.connect_ai() 
        
        chunks = vectorizer.chunk_quests()
        vectorizer.embed_and_upsert(chunks)
        
        print("Pipeline Complete. 🚀")
        
    except Exception as e:
        print(f"Pipeline Error: {e}")
