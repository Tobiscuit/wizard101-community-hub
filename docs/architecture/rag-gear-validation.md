# 🧠 Architecture: RAG-Based Gear Validation (Future)

**Goal**: Automatically validate if a piece of gear is "Meta" (Best-in-Slot) or "viable" for a specific school/level, rather than relying on hardcoded keywords.

## The Problem
Hardcoded lists (`['Dream Reaver', 'Aeon']`) are brittle. New updates (e.g., "Wallaru Part 2") break them immediately.
We need a system that "knows" what the item is and its stats.

## Proposed Stack
1.  **Data Source**: Wizard101 Central Wiki (Scraped).
2.  **Vector Database**: Firestore Vector Search (Native) or Pinecone.
3.  **LLM**: Gemini 3.0 (Multimodal) - *The "Bleeding Edge" standard.*

## Workflow

### 1. Ingestion Pipeline (The "Knowledge Base")
*   **Scraper**: A scheduled job scrapes Wizard101 Central for Items.
    *   Extracts: `Item Name`, `Level Requirement`, `School`, `Socket Types`, `Stats` (Damage, Resist).
*   **Embedder**: Text-embedding-004 (Google) to vectorise the item data.
*   **Storage**: Store vectors in Firestore `wiki_items` collection.

### 2. The "Scanner" Flow (Runtime)
1.  **OCR**: User uploads screenshot. Gemini 3.0 extracts text: "Fervid Dream Reaver Armor".
2.  **Retrieval**: System queries Vector DB for "Fervid Dream Reaver Armor".
3.  **Validation**:
    *   Retrieved Record: `{ name: "Fervid Dream Reaver Armor", level: 170, school: "Fire" }`
    *   User Profile: `{ level: 170, school: "Fire" }`
    *   **Logic**: Match? ✅
4.  **"Meta" Check**:
    *   Compare item stats against a "Reference Best-in-Slot" profile for that slot.
    *   *Example*: "Is this `Dream Reaver` better than `Dragoon`?" -> Yes (Level 170 > 130).

## Tech Stack Options (2026)
*   **Google Vertex AI Search**: 
    *   **Capability**: Literally "Point and Shoot". You give it the Wiki URL, it indexes everything. No custom scraper needed.
    *   **Cost**: Enterprise-grade (~$0.20 per 1k queries). Worth it for the zero-maintenance aspect.
    *   **Constraint**: The game updates slowly, so a manual scraper is cheaper, but Vertex is "Magic".
*   **AWS Bedrock**: Knowledge Bases feature.
*   **Custom (LangChain)**: Flexible but high maintenance.

**Recommendation**: Start with **Vertex AI Search** if budget permits. It converts the entire Wiki into an API in minutes.

