import { GoogleGenAI, Type } from "@google/genai";
import { WordPair } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWordPairs = async (topic: string, count: number = 5): Promise<WordPair[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} pairs of words for the game 'Who is the Spy' (谁是卧底). 
      The topic is: ${topic || 'Random'}.
      The 'civilian' word and 'spy' word must be related but distinct.
      Language: Simplified Chinese (简体中文).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              civilian: { type: Type.STRING, description: "Word for civilians" },
              spy: { type: Type.STRING, description: "Word for spies" },
              category: { type: Type.STRING, description: "Category of the words" }
            },
            required: ["civilian", "spy", "category"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    
    // Transform to add IDs
    return data.map((item: any) => ({
      id: crypto.randomUUID(),
      civilian: item.civilian,
      spy: item.spy,
      category: item.category
    }));

  } catch (error) {
    console.error("Failed to generate words:", error);
    throw new Error("Failed to generate word pairs using AI.");
  }
};