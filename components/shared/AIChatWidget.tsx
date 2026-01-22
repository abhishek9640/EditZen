"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            const result = await response.json();

            if (result.success) {
                setMessages((prev) => [...prev, result.data]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Sorry, I encountered an error. Please try again.",
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I couldn't connect. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        "How do I remove an object?",
        "What is generative fill?",
        "How to change colors?",
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-purple-200/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-purple-600 text-white shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Image
                                    src="/assets/icons/stars.svg"
                                    alt="AI"
                                    width={18}
                                    height={18}
                                    className="invert brightness-0"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm leading-tight">EditZen Assistant</h3>
                                <p className="text-[10px] text-purple-200 font-medium tracking-wide">ALWAYS ONLINE</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full text-white/90 hover:text-white transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-purple-50/30 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                        {messages.length === 0 && (
                            <div className="text-center py-8 px-4">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200/50 shadow-sm">
                                    <Image
                                        src="/assets/icons/stars.svg"
                                        alt="AI"
                                        width={32}
                                        height={32}
                                        className="opacity-50"
                                    />
                                </div>
                                <h4 className="text-dark-600 font-semibold mb-2">Hello! 👋</h4>
                                <p className="text-dark-400 text-xs mb-6 max-w-[200px] mx-auto leading-relaxed">
                                    I can help you edit images or answer questions about EditZen.
                                </p>
                                <div className="space-y-2">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(action)}
                                            className="block w-full text-left px-4 py-3 text-xs font-medium bg-white hover:bg-purple-50 text-dark-500 hover:text-purple-600 rounded-xl border border-purple-100 hover:border-purple-200 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${message.role === "user"
                                        ? "bg-purple-600 text-white rounded-br-none"
                                        : "bg-white text-dark-600 border border-purple-100 rounded-bl-none"
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-purple-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                        <span
                                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.15s" }}
                                        />
                                        <span
                                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.3s" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-purple-100">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage(inputValue);
                            }}
                            className="flex gap-2 relative"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 pl-4 pr-12 py-3 bg-purple-50/50 text-dark-600 text-sm rounded-xl border border-purple-100 focus:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100/50 placeholder:text-dark-400/50 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="absolute right-2 top-1.5 p-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:bg-purple-300 rounded-lg text-white transition-all shadow-sm hover:shadow-md"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl shadow-purple-500/20 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20 ${isOpen
                    ? "bg-dark-600 text-white rotate-90"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
            >
                {isOpen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <Image
                        src="/assets/icons/stars.svg"
                        alt="AI Chat"
                        width={24}
                        height={24}
                        className="brightness-0 invert"
                    />
                )}
            </button>
        </div>
    );
};

export default AIChatWidget;
