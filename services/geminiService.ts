
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, RefinementTone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateViralStrategy = async (userData: UserData, tone?: RefinementTone) => {
  const model = "gemini-3-flash-preview";
  
  const systemPrompt = `You are "ViralForge", an expert viral video strategist. Your goal is to help creators maximize engagement.
  Output Rules:
  - Use clear headings.
  - No emoji overload.
  - No unnecessary explanations.
  - Return in Markdown.`;

  const userPrompt = `Generate a viral strategy for a video with these details:
  - Platform: ${userData.platform}
  - Topic: ${userData.topic}
  - Audience: ${userData.audience}
  - Key Emotion: ${userData.emotion}
  - Style: ${userData.style}
  - Main Benefit: ${userData.benefit}
  ${tone ? `- NEW Tone Requirement: Make the titles and hooks more ${tone}.` : ''}

  Please generate:
  A) 5 Viral Video Titles (Short, clear, curiosity-driven, optimized for ${userData.platform})
  B) 3 Scroll-Stopping Hooks (Spoken-friendly, bold, attention-grabbing)
  C) Suggested Video Flow:
     - Hook (0–3 sec)
     - Context (3–10 sec)
     - Main Value (10–40 sec)
     - Payoff / CTA (last 5 sec)`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};
