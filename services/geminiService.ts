import { GoogleGenAI } from "@google/genai";
import type { AspectRatio } from '../types';

// FIX: Removed conflicting global declaration for `window.aistudio`.
// This type is likely provided by another dependency, and redeclaring it causes a compilation error.

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const generateVideo = async (
    prompt: string,
    aspectRatio: AspectRatio,
    imageFile: File | null
) => {
    const ai = getAiClient();
    let imagePayload;
    if (imageFile) {
        const base64Data = await fileToBase64(imageFile);
        imagePayload = {
            imageBytes: base64Data,
            mimeType: imageFile.type,
        };
    }

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: imagePayload,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error("Video generation failed or returned no URI.");
    }
    
    const downloadLink = operation.response.generatedVideos[0].video.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const searchWithMaps = async (query: string, location: { latitude: number; longitude: number; }) => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: location.latitude,
                        longitude: location.longitude
                    }
                }
            }
        },
    });

    return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
};