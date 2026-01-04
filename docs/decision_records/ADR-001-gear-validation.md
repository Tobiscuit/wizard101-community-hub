# ADR-001: Gear Validation Strategy (RAG vs Data Mining)

## Context
We need to validate if a user's gear (uploaded via screenshot) is "Meta" or has good stats.
Two primary approaches have been proposed:
1.  **RAG (Retrieval Augmented Generation)**: Using Gemini + Vector Search to "read" the wiki and validate.
2.  **Data Mining / Static DB**: Maintaining a structural database of items and stats.

## Comparison

### Option A: RAG (AI-Native)
*   **How**: OCR extracts text -> Vector Search finds Wiki page -> Gemini compares.
*   **Pros**:
    *   **Low Maintenance**: Automatically adapts to new items if the Wiki is updated.
    *   **Flexible**: Can understand nuance ("This robe is good for defensive builds").
*   **Cons**:
    *   **Latency**: AI + Vector Search is slower (2-5s).
    *   **Cost**: Per-token, per-search cost.
    *   **Accuracy**: Non-deterministic. Can "hallucinate" or miss exact stat values.

### Option B: Data Mining / Static DB (Deterministic)
*   **How**: Scrape Wiki once -> Build `items.json` -> Logic compares `input.stats` vs `db.item.stats`.
*   **Pros**:
    *   **Speed**: Instant (<50ms).
    *   **Accuracy**: 100% deterministic (Math-based).
    *   **Cost**: Free (running locally or basic DB read).
*   **Cons**:
    *   **High Maintenance**: Requires re-scraping/updating whenever a new pack drops.
    *   **Fragile Scrapers**: Wiki structure changes break the importer.

## Recommendation: Game Data RAG (The "Truth Engine")
The user verified that we should perform **RAG on Data Mined Files**, rather than the Wiki, to ensure 100% accuracy and freshness.

1.  **Ingestion ("The Mine")**: We will ingest raw Game Data Dumps (JSON/CSV extracted from game files) into our **Vector Store**.
2.  **Runtime**: Gemini 3.0 will query this "Source of Truth" to validate user gear.

**Verdict**: **Game Data RAG**.
This treats the Data Mine as the "Gold Standard" artifact, traversed efficiently by AI Vector Search.
