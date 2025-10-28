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

export const recognizeColor = async (imageDataUrl: string, targetColorName: string, language: string, allColors: string[]): Promise<string> => {
    try {
        const imagePart = fileToGenerativePart(imageDataUrl, "image/jpeg");
        const prompt = `
            You are a color identification expert for a children's educational app.
            The user is showing you an object. Your task is to identify its main, primary color.
            The list of possible colors in language "${language}" is: [${allColors.join(', ')}].
            - Analyze the central object in the image.
            - Respond with ONLY the name of the color you identified from the provided list.
            - If you cannot identify a clear color, or the color is not on the list, respond with "?".
            - Do not add any explanation or any other text.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
        });

        const text = response.text.trim();

        // Basic validation: Check if the response is one of the possible colors or "?"
        const validResponses = [...allColors.map(c => c.toLowerCase()), '?'];
        if (validResponses.includes(text.toLowerCase())) {
            return text;
        }

        // Fallback if the model returns something unexpected
        return "?";

    } catch (error) {
        console.error("Error calling Gemini API for color recognition:", error);
        throw new Error("Could not recognize the color. Please try again.");
    }
};

// FIX: Added the missing `recognizeNumber` function to resolve the import error. This function uses the Gemini API to identify a number from an image, similar to the existing `recognizeLetter` function.
export const recognizeNumber = async (imageDataUrl: string): Promise<string> => {
  try {
    const imagePart = fileToGenerativePart(imageDataUrl, "image/jpeg");
    const prompt = `
      You are an expert in optical character recognition for educational purposes.
      Your task is to identify the single, primary, centered number in this image.
      - The number can have one or more digits (e.g., "7", "12", "150").
      - Respond with ONLY the number you identify.
      - If no clear number is visible, or if there are other characters, respond with "?".
      - Do not add any explanation or any other text.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
    });
    
    const text = response.text.trim();

    // Check if the response is a valid number or "?"
    if (text === '?' || /^\d+$/.test(text)) {
      return text;
    }

    // If the model returns something unexpected, return "?"
    return "?";
  } catch (error) {
    console.error("Error calling Gemini API for number recognition:", error);
    throw new Error("Could not recognize the number. Please try again.");
  }
};
