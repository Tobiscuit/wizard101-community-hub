"use server";

import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// System instruction for Gamma's Persona
const SYSTEM_INSTRUCTION = `
You are Gamma, the wise and ancient Owl of the Arcanum from Wizard101.
Your role is "The Scribe" - a helper who verifies information using the Spiral's archives (Google Search).

Persona:
- You speak with wisdom, slightly formal but helpful ("Greetings, young Wizard").
- You OFTEN reference "The Spiral", "The Arcanum", or "Magic".
- You are polite but brief.
- If you use Google Search, mention "I have consulted the archives...".
- If the user asks about stats, drops, or cheats, use your Grounding tool to find the specific answer.
`;

export async function chatWithGamma(history: ChatMessage[]) {
  const isHibernate = process.env.HIBERNATE_MODE === "true";
  const llamaUrl = process.env.LLAMA_API_URL; // e.g. "https://api.commons.jrcodex.dev/v1/chat/completions"

  // 1. Try Llama (Primary) if server is active and URL is set
  if (!isHibernate && llamaUrl) {
    try {
        const response = await fetch(llamaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3-8b-instruct", // Or whatever model you host
                messages: [{ role: "system", content: SYSTEM_INSTRUCTION }, ...history],
                temperature: 0.7
            }),
            signal: AbortSignal.timeout(5000) // 5s Timeout for fast fallback
        });

        if (response.ok) {
            const data = await response.json();
            return {
                role: "assistant",
                content: data.choices[0].message.content
            };
        }
        console.warn("Llama fetch failed:", response.status);
    } catch (err) {
        console.warn("Llama unreachable (Fallback to Gemini):", err);
    }
  }

  // 2. Fallback to Gemini 3.0 (Cloud Backup)
  // This runs if:
  // - Hibernate is TRUE
  // - Llama is undefined
  // - Llama failed/timed out
  
  if (!apiKey) {
    return { 
      role: "assistant", 
      content: "My connection to the Spiral is broken. (Missing GEMINI_API_KEY)" 
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Inject "Resting" context only if we are in this block because of Hibernate/Fallback
    const fallbackContext = isHibernate 
        ? "\n(Note: The Arcanum is closed for the night. You are currently meditating. Kindly inform the Wizard you are in 'Low Power Mode' but can still help.)" 
        : "";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.0-flash-preview", 
      systemInstruction: SYSTEM_INSTRUCTION + fallbackContext,
      tools: [{ googleSearch: {} }],
    });

    const chatHistory: Content[] = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = chatHistory.pop();
    if (!lastMessage) throw new Error("Empty history");

    const chatSession = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    });

    const result = await chatSession.sendMessage(lastMessage.parts);
    const response = await result.response;
    return {
      role: "assistant",
      content: response.text(),
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      role: "assistant", 
      content: "Hoot! All magical channels are down. I cannot reach the Arcanum." 
    };
  }
}
