import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from '../services/geminiService';
import type { AspectRatio } from '../types';
import Spinner from './Spinner';

const loadingMessages = [
  "Warming up the AI director...",
  "Casting digital actors...",
  "Scouting virtual locations...",
  "Rendering the first scenes...",
  "Applying cinematic effects...",
  "Adding the soundtrack...",
  "Finalizing the masterpiece... this can take a few minutes.",
];

const VideoGenerator: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [prompt, setPrompt] = useState('A majestic lion roaring on a cliff at sunrise');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio) {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } catch (e) {
            console.error("Error checking API key:", e);
            setApiKeySelected(false);
        }
    }
  }, []);

  // FIX: Refactored useEffect to fix 'NodeJS' namespace error and improve interval handling.
  // The type for setInterval's return value in a browser is `number`, not `NodeJS.Timeout`.
  // This new implementation correctly scopes the interval and its cleanup.
  useEffect(() => {
    checkApiKey();
    if (isLoading) {
      let messageIndex = 0;
      const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 4000);
      return () => clearInterval(intervalId);
    }
  }, [isLoading, checkApiKey]);
  
  const handleSelectKey = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // Assume success and optimistically update UI
            setApiKeySelected(true);
        } catch (e) {
            console.error("Error opening select key dialog:", e);
            setError("Failed to open API key selection. Please try again.");
        }
    } else {
        setError("API key selection utility is not available.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    if(!apiKeySelected) {
        setError("Please select an API key first.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const videoUrl = await generateVideo(prompt, aspectRatio, imageFile);
      setGeneratedVideoUrl(videoUrl);
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || "An unknown error occurred.";
      if (errorMessage.includes("Requested entity was not found")) {
        errorMessage = "Your API key seems invalid. Please select a valid key and try again.";
        setApiKeySelected(false);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if(!apiKeySelected) {
      return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4 text-white">API Key Required for Veo</h2>
            <p className="mb-4 text-gray-300">Veo video generation requires an API key with access to the model. Please select your key to continue.</p>
            <p className="mb-6 text-sm text-gray-400">For more information on billing, visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.</p>
            <button onClick={handleSelectKey} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                Select API Key
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
      );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                    Video Prompt
                </label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="e.g., A cinematic shot of a futuristic city at night"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <div className="flex space-x-4">
                    {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                        </button>
                    ))}
                </div>
                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mt-4 mb-2">
                    Optional: Upload a starting image
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600" />
            </div>
        </div>

        {imagePreview && (
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Image Preview:</p>
                <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
            </div>
        )}

        <div className="mt-6 text-center">
            <button
                onClick={handleGenerateClick}
                disabled={isLoading}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors text-lg"
            >
                {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
        </div>

        {isLoading && (
            <div className="mt-6 text-center">
                <Spinner className="w-12 h-12 mx-auto" />
                <p className="mt-4 text-lg text-indigo-300 animate-pulse">{loadingMessage}</p>
            </div>
        )}

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        
        {generatedVideoUrl && (
            <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-center text-white">Generated Video</h3>
                <video src={generatedVideoUrl} controls autoPlay loop className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl" />
            </div>
        )}
    </div>
  );
};

export default VideoGenerator;