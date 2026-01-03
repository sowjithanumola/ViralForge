
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, RefinementTone } from "../types";

export const generateViralStrategy = async (userData: UserData, tone?: RefinementTone) => {
  // Creating instance inside the function call ensures the most up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are "ViralForge", an expert viral video strategist. Your goal is to help creators maximize engagement.
  Rules:
  - Focus on virality, curiosity, clarity, and emotion.
  - No login prompts.
  - No emoji overload.
  - Use clear headings and bullet points.
  - Adapt suggestions strictly to the user's platform and topic.`;

  const userPrompt = `Forge a viral strategy for this video:
  - Platform: ${userData.platform}
  - Topic: ${userData.topic}
  - Audience: ${userData.audience}
  - Key Emotion: ${userData.emotion}
  - Style: ${userData.style}
  - Main Benefit/Surprise: ${userData.benefit}
  ${tone ? `- Tone Adjustment: Make it significantly more ${tone}.` : ''}

  Please generate:
  A) 5 Viral Video Titles
  B) 3 Scroll-Stopping Hooks
  C) Suggested Video Flow (Hook, Context, Main Value, Payoff)`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.9, // Higher temperature for more creative/viral titles
      }
    });

    // Access the .text property directly as per the latest SDK guidelines
    return response.text || "No response generated.";
  } catch (error) {
    console.error("ViralForge API Error:", error);
    throw new Error("The Forge is currently overheated. Please check your connection and try again.");
  }
};
