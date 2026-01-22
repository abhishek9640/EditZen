import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json(
                { error: "Image URL is required" },
                { status: 400 }
            );
        }

        const analysis = await analyzeImage(imageUrl);

        return NextResponse.json({ success: true, data: analysis });
    } catch (error) {
        console.error("Image analysis error:", error);
        return NextResponse.json(
            { error: "Failed to analyze image" },
            { status: 500 }
        );
    }
}
