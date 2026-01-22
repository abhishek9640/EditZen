import { NextRequest, NextResponse } from "next/server";
import { suggestPrompts } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, transformationType } = await req.json();

        if (!imageUrl) {
            return NextResponse.json(
                { error: "Image URL is required" },
                { status: 400 }
            );
        }

        if (!transformationType || !["remove", "recolor"].includes(transformationType)) {
            return NextResponse.json(
                { error: "Valid transformation type (remove/recolor) is required" },
                { status: 400 }
            );
        }

        const suggestions = await suggestPrompts(imageUrl, transformationType);

        return NextResponse.json({ success: true, data: suggestions });
    } catch (error) {
        console.error("Prompt suggestion error:", error);
        return NextResponse.json(
            { error: "Failed to generate suggestions" },
            { status: 500 }
        );
    }
}
