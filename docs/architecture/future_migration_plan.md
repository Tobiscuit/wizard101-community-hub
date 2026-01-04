# Future Architecture: Hetzner Migration Plan (Replatforming)

**Context**: 
We are initially launching with **Serverless Cloud API (Gemini)** to minimize upfront costs and ops (Zero-Ops).
However, the long-term goal is to **Replatform** to a self-hosted **Hetzner VPS** for privacy, fixed costs, and control.

## Source Context (Chat Log)
*See attached JSON Artifact `hetzner_chat_context.json` for full reasoning.*

## Target Infrastructure (The "Ritual Circle")
*   **Provider**: Hetzner Cloud.
*   **Server Tier**: **CCX23** (4 vCPU, 16 GB RAM) ~ $30/mo.
    *   *Why 16GB?*: "Always On" requirement. Llama 3 8B (5GB) + OS/Next.js/VectorDB (3GB) + KV Cache overhead needs room to breathe. 8GB is too risky for OOM crashes.
*   **Orchestration**: Docker Compose (Simple) or K3s (Scalable).
*   **Model**: Llama 3 (8B) quantized (4-bit).
*   **Vector DB**: Qdrant or Weaviate (Self-Hosted).

## The Replatforming Strategy ("Lift, Tinker, Shift")
We are currently in the **Serverless Phase**. To ensure the future migration is painless, we must implement an **Abstraction Layer** now.

### Abstraction: `LLMService` Interface
Code against this interface, not the Gemini SDK directly.

```typescript
interface LLMService {
    generate(prompt: string, context: string[]): Promise<string>;
    stream(prompt: string, context: string[]): Promise<ReadableStream>;
}

// Implementation A (Current): GoogleGeminiProvider
// Implementation B (Future): OllamaProvider (points to hetzner-ip:11434)
```

## Trigger for Migration
When do we switch?
1.  **Cost Crossover**: When Gemini API API bill > $30/mo.
2.  **Privacy**: If users demand "Zero Telemetry" mode.
3.  **Throughput**: If we need custom fine-tunes.
