"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SmartPromptSuggestions = ({
    imageUrl,
    transformationType,
    onSuggestionClick,
}: SmartPromptSuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!imageUrl) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/ai/suggest", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageUrl, transformationType }),
                });

                const result = await response.json();

                if (result.success) {
                    setSuggestions(result.data);
                } else {
                    setError(result.error || "Failed to get suggestions");
                }
            } catch (err) {
                setError("Failed to get suggestions");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [imageUrl, transformationType]);

    if (!imageUrl) return null;

    if (isLoading) {
        return (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-purple-100 border border-purple-200/20 shadow-sm">
                <div className="animate-spin text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                </div>
                <p className="text-dark-600 text-sm font-medium animate-pulse">Analyzing image for suggestions...</p>
            </div>
        );
    }

    if (error || suggestions.length === 0) return null;

    return (
        <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
                <Image
                    src="/assets/icons/stars.svg"
                    alt="AI"
                    width={18}
                    height={18}
                />
                <p className="text-dark-400 font-semibold text-sm">AI Suggestions</p>
            </div>
            <div className="flex flex-wrap gap-3">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() =>
                            onSuggestionClick(suggestion.value, suggestion.suggestedColor)
                        }
                        className="group flex items-center gap-2 px-4 py-2 bg-purple-100/50 hover:bg-purple-100 text-dark-600 hover:text-purple-600 font-medium text-sm rounded-full border border-purple-200/20 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <span>{suggestion.label}</span>
                        {suggestion.suggestedColor && (
                            <span className="text-purple-500 font-semibold">→ {suggestion.suggestedColor}</span>
                        )}
                        {suggestion.confidence >= 0.8 && (
                            <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" title="High confidence" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SmartPromptSuggestions;
