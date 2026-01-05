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

Personality:
- Wise, slightly formal, but warm ("Hoot! Greetings, young Wizard").
- You possess vast knowledge of the Spiral (Quests, Spells, Items).
- If you don't know something, admit it, but suggest checking the Arcanum archives.
- You are helpful but brief. Do not drone on like a professor unless asked.

Capabilities:
- You have access to the "Wizard's Knowledge Base" (Context provided below).
- ALWAYS prioritize the provided Context over your general training.
- If the Context contains the answer, cite it indirectly ("The archives state...").
`;

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
        // Note: 'match_documents' arg names must match the SQL definition EXACTLY.
        const { data: chunks, error } = await sb.rpc("match_documents", {
            query_embedding: queryVector,
            match_threshold: 0.5, // Strictness
            match_count: 5        // Top 5 chunks
        });

        if (error) {
            console.error("Supabase vector search error:", error);
            return "";
        }
        
        if (!chunks || chunks.length === 0) return "";

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
      model: "gemini-1.5-flash", // Upgrade to 1.5 Flash for speed/cost
      systemInstruction: finalSystemPrompt,
      // tools: [{ googleSearch: {} }], // Optional: Disable Google Search if we rely on RAG, or keep for fallback. keeping for now.
    });

    // 5. Convert History
    const chatHistory: Content[] = history.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 600, temperature: 0.6 },
    });

    const result = await chatSession.sendMessage(userQuery);
    const response = await result.response;
    
    return {
      role: "assistant",
      content: response.text(),
    };

  } catch (error) {
    console.error("Gamma Error:", error);
    return { 
      role: "assistant", 
      content: "Hoot! The winds of the Spiral are disrupting my thoughts. (Error)" 
    };
  }
}
