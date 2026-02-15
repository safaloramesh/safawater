
import { GoogleGenAI } from "@google/genai";

// Fixed: Correctly initialize with named parameter and direct process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSalesInsights = async (salesData: any[], pumpData: any[]) => {
  try {
    const prompt = `Analyze this water sales data for Safa Water and provide a 3-sentence summary of performance and one recommendation for efficiency. 
    Sales: ${JSON.stringify(salesData.slice(-10))}
    Pumps: ${JSON.stringify(pumpData)}`;

    // Fixed: Using ai.models.generateContent directly to query GenAI.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Fixed: Accessing the .text property directly.
    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Insights unavailable. Please check your API configuration.";
  }
};
