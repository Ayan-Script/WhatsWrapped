
import { GoogleGenAI, Type } from "@google/genai";
import { ChatStats, AiInsights } from "../types";

export const getAiInsights = async (stats: ChatStats, sampleText: string): Promise<AiInsights> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const topSenders = Object.entries(stats.senders)
    // Fix: Explicitly cast to number to avoid arithmetic operation errors
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)
    .map(([name, count]) => `${name} (${count} messages)`)
    .join(", ");

  const prompt = `
    Analyze these chat statistics and a small sample of chat content. 
    Provide a "Spotify Wrapped" style summary.
    
    Stats:
    - Total Messages: ${stats.totalMessages}
    - Top Friends: ${topSenders}
    - Busiest Hour: ${Object.entries(stats.hourlyDistribution).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]}:00
    - Most active day: ${stats.mostActiveDay}
    
    Sample Content (Privacy-safe snippet):
    ${sampleText}

    Return a JSON object with:
    1. vibe: A 2-word punchy description (e.g., "Chaotic Energy", "Wholesome Support")
    2. insideJokes: An array of 3 potential inside jokes or recurring themes found.
    3. friendshipSummary: A short, poetic, or funny 2-sentence summary of the bond.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibe: { type: Type.STRING },
            insideJokes: { type: Type.ARRAY, items: { type: Type.STRING } },
            friendshipSummary: { type: Type.STRING }
          },
          required: ["vibe", "insideJokes", "friendshipSummary"]
        }
      }
    });

    // Fix: Directly access the .text property from the response
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      vibe: "Pure Connection",
      insideJokes: ["Late night chats", "Coffee dates", "Emoji wars"],
      friendshipSummary: "You two share a bond that transcends digital messages. Keep the conversation going!"
    };
  }
};
