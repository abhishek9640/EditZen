"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const ImageAnalysis = ({ imageUrl, onSuggestionClick }: ImageAnalysisProps) => {
    const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!imageUrl) {
            setAnalysis(null);
            return;
        }

        const analyzeImage = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/ai/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageUrl }),
                });

                const result = await response.json();

                if (result.success) {
                    setAnalysis(result.data);
                } else {
                    setError(result.error || "Failed to analyze image");
                }
            } catch (err) {
                setError("Failed to analyze image");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        analyzeImage();
    }, [imageUrl]);

    if (!imageUrl) return null;

    if (isLoading) {
        return (
            <div className="mt-4 p-4 bg-dark-400/50 rounded-xl border border-dark-400">
                <div className="flex items-center gap-3">
                    <div className="animate-spin">
                        <Image
                            src="/assets/icons/spinner.svg"
                            alt="Loading"
                            width={20}
                            height={20}
                        />
                    </div>
                    <p className="text-white/70 text-sm">Analyzing image with AI...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        );
    }

    if (!analysis) return null;

    return (
        <div className="mt-4 p-4 bg-dark-400/50 rounded-xl border border-dark-400 space-y-4">
            <div className="flex items-center gap-2">
                <Image
                    src="/assets/icons/stars.svg"
                    alt="AI"
                    width={20}
                    height={20}
                />
                <h4 className="font-semibold text-white">AI Analysis</h4>
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm leading-relaxed">
                {analysis.description}
            </p>

            {/* Objects Detected */}
            {analysis.objects.length > 0 && (
                <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                        Objects Detected
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {analysis.objects.map((obj, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                            >
                                {obj}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Colors */}
            {analysis.colors.length > 0 && (
                <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                        Dominant Colors
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {analysis.colors.map((color, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                            >
                                {color}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Transformations */}
            {analysis.suggestedTransformations.length > 0 && onSuggestionClick && (
                <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                        Suggested Edits
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {analysis.suggestedTransformations.map((transform, index) => (
                            <button
                                key={index}
                                onClick={() => onSuggestionClick(transform)}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full hover:opacity-90 transition-opacity"
                            >
                                Try {transform}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageAnalysis;
