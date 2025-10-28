import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType,
    },
  };
};

export const recognizeLetter = async (imageDataUrl: string, alphabet: string[]): Promise<string> => {
  try {
    const imagePart = fileToGenerativePart(imageDataUrl, "image/jpeg");
    const prompt = `
      You are an expert in optical character recognition for educational purposes.
      Your task is to identify the single, primary, centered letter in this image, from the following alphabet: ${alphabet.join(', ')}.
      - Respond with ONLY the single letter you identify (e.g., "A", "b", "G").
      - If no clear letter from the specified alphabet is visible, or if there are multiple letters, respond with "?".
      - Do not add any explanation or any other text.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
    });
    
    const text = response.text.trim();

    if (text.length > 2 || text.length === 0) { // Allow for single chars and "?"
        return "?";
    }

    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not recognize the letter. Please try again.");
  }
};
