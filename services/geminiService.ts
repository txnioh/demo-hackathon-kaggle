
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ProductDetails } from '../types';

// FIX: Per guidelines, API key is assumed to be available from `process.env.API_KEY`.
// Removed fallback string and conditional warning.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fillProductDetails(imageBase64: string, mimeType: string): Promise<ProductDetails> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
                {
                    text: "Analyze this product image. Provide a creative, concise title, a detailed description (mentioning potential materials, style, and use), and a suggested price in USD. Format the output as JSON."
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    price: { type: Type.STRING }
                },
                // FIX: Removed the `required` property as it's not a supported part of the responseSchema config.
            }
        },
    });

    const jsonString = response.text.trim();
    try {
        // Models can sometimes wrap JSON in markdown, let's extract it.
        const match = jsonString.match(/```(json)?\n?([\s\S]*?)\n?```/);
        const parsableString = match ? match[2] : jsonString;
        const parsed = JSON.parse(parsableString);
        return {
            title: parsed.title || '',
            description: parsed.description || '',
            price: parsed.price || '',
        };
    } catch (e) {
        console.error("Failed to parse JSON response for product details:", jsonString);
        throw new Error("Invalid JSON response from API.");
    }
}

export async function generateBackground(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A professional, high-quality studio photography background: ${prompt}. Centered, clean, photorealistic.`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    throw new Error("Image generation failed.");
}

export async function enhanceImage(productBase64: string, backgroundBase64: string, productMimeType: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: { data: productBase64, mimeType: productMimeType },
                },
                {
                    inlineData: { data: backgroundBase64, mimeType: 'image/jpeg' },
                },
                { text: 'Your task is to replace the original background of the first image (the product) with the second image (the studio background). The final image should only contain the product seamlessly placed on the new background. Preserve the product\'s natural shadows and lighting. Do not add any extra elements.' },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("Image enhancement failed, no image was returned.");
}
