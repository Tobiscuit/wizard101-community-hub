"use server";

import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Keys
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const sbUrl = process.env.SUPABASE_URL;
const sbKey = process.env.SUPABASE_ANON_KEY!; // Anon is fine for reading RLS-public data

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// 🦉 Gamma's Persona
const BASE_SYSTEM_INSTRUCTION = `
You are Gamma, the wise and ancient Owl of the Arcanum.
Role: The Spiral's Librarian & Guide.

- Wise, slightly formal, but warm ("Hoot! Greetings, young Wizard"). (Persona: Gamma the Owl).
- **Cognitive Goal**: Minimize the user's workload.
- **Formatting Rules**:
    1. **Chunking**: Keep paragraphs short (max 2-3 sentences).
    2. **Scannability**: ALWAYS **bold** key entities (Bosses, Spells, Locations, Items, Stats).
    3. **Lists**: Use Markdown bullet points for any sequence of steps or options.
    4. **Tables**: Use Markdown tables for comparing stats, drops, or rates.
- Use your tools (Google Search) proactively if need be.

Capabilities:
- You have access to the "Wizard's Knowledge Base" (Context provided below).
- ALWAYS prioritize the provided Context over your general training.
- If the Context contains the answer, cite it indirectly ("The archives state...").
- IMPORTANT: You are a persona. Do NOT output your internal reasoning, "plans", or self-corrections. Reply ONLY with the final in-character response.`;

// Helper: Retrieve Context from Supabase
async function retrieveContext(query: string) {
    if (!sbUrl || !sbKey || !apiKey) return "";
    
    try {
        const sb = createClient(sbUrl, sbKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        
        // 1. Embed Query
        const emRes = await embedModel.embedContent(query);
        const queryVector = emRes.embedding.values;

        // 2. Search Supabase (RPC match_documents)
        console.log(`[Gamma] Searching Supabase for: "${query}" (Threshold: 0.4)`);
        
        const { data: chunks, error } = await sb.rpc("match_documents", {
            query_embedding: queryVector,
            match_threshold: 0.4, // Strictness Tuned (0.5 was too high)
            match_count: 5        // Top 5 chunks
        });

        if (error) {
            console.error("[Gamma] Supabase vector search error:", error);
            return "";
        }
        
        if (!chunks || chunks.length === 0) {
            console.warn("[Gamma] No relevant documents found in Arcanum Archives.");
            return "";
        }
        
        console.log(`[Gamma] Found ${chunks.length} docs. Top Score: ${chunks[0].similarity.toFixed(4)}`);
        
        // 3. Format Context
        const contextText = chunks.map((c: any) => 
            `[Source: ${c.category} | ${c.title}]\n${c.content}`
        ).join("\n\n");
        
        return `\n\n=== ARCANUM ARCHIVES (Use this to answer) ===\n${contextText}\n=============================================\n`;

    } catch (e) {
        console.error("Context Retrieval Failed:", e);
        return "";
    }
}

export async function chatWithGamma(history: ChatMessage[]) {
  const isHibernate = process.env.HIBERNATE_MODE === "true";
  
  if (!apiKey) {
    return { role: "assistant", content: "Hoot! My magical connection (API Key) is broken." };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 1. Get User's Last Message
    const lastUserMsg = history[history.length - 1];
    const userQuery = lastUserMsg?.role === "user" ? lastUserMsg.content : "";

    // 2. Retrieve RAG Context (Parallelize if slow, but simplistic for now)
    let ragContext = "";
    if (userQuery) {
        ragContext = await retrieveContext(userQuery);
    }
    
    // 3. Construct System Prompt
    const finalSystemPrompt = BASE_SYSTEM_INSTRUCTION + (isHibernate ? "\n(Note: Low Power Mode active)" : "") + ragContext;

    // 4. Init Model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview", 
      systemInstruction: finalSystemPrompt + `
      
      IMPORTANT: You must output a JSON object in this format:
      {
        "original_query": "The user's question",
        "reasoning": "Your internal Chain of Thought",
        "content": "The final response to the user (Keep this CONCISE)",
        "source_used": "Tool or Document used"
      }
      Do NOT output Markdown fencing around the JSON. Just the raw JSON object.
      `,
      // @ts-expect-error - googleSearch is available in v1beta/experimental but types might lag
      tools: [{ googleSearch: {} }], 
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // 5. Convert History
    // Gemini Rule: History must start with 'user'.
    let validHistory = history.slice(0, -1);
    while (validHistory.length > 0 && validHistory[0].role === "assistant") {
        validHistory.shift();
    }

    const chatHistory: Content[] = validHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
        history: chatHistory,
    });

    const result = await chat.sendMessage(userQuery);
    const responseText = result.response.text();
    
    // Parse JSON
    try {
        const jsonResponse = JSON.parse(responseText);
        console.log("[Gamma Reasoning]", jsonResponse.reasoning); // Server-side trace
        
        return {
            role: "assistant",
            content: jsonResponse.content // Send ONLY the clean content to client
        };
    } catch (e) {
        // Fallback if model fails JSON (rare with MIME type set)
        console.error("JSON Parse Error:", e, responseText);
        return {
            role: "assistant",
            content: responseText
        };
    }

  } catch (error) {
    console.error("Gamma Error:", error);
    return { 
      role: "assistant", 
      content: "Hoot! The winds of the Spiral are disrupting my thoughts. (Error)" 
    };
  }
}
