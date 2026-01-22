import { NextRequest, NextResponse } from "next/server";
import { chatWithAssistant } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        const response = await chatWithAssistant(messages, context);

        return NextResponse.json({
            success: true,
            data: {
                role: "assistant",
                content: response,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Failed to get chat response" },
            { status: 500 }
        );
    }
}
