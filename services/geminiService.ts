
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getArtisticDescription = async (photoTitle: string, location: string, lang: string = 'en'): Promise<string> => {
  try {
    const langMap: Record<string, string> = {
      'ar': 'Arabic',
      'fr': 'French',
      'en': 'English'
    };
    
    const targetLang = langMap[lang] || 'English';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an artistic curator, write a poetic 2-sentence description for a professional photograph titled "${photoTitle}" taken in "${location}", Morocco. Keep it evocative of Moroccan culture and light. IMPORTANT: Write the response ONLY in ${targetLang}.`,
    });
    
    return response.text || "Capturing the timeless beauty of Morocco.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A moment captured in the heart of Morocco.";
  }
};
