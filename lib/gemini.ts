import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

/**
 * Generate text content using Gemini
 */
export async function generateText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Analyze an image and return description with suggestions
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Fetch image and convert to base64
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

  const imagePart: Part = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const prompt = `Analyze this image and provide:
1. A brief description (2-3 sentences)
2. List of main objects detected (up to 5)
3. Dominant colors (up to 4)
4. Suggested transformations from: restore, fill, remove, recolor, removeBackground

Respond in JSON format:
{
  "description": "...",
  "objects": ["object1", "object2"],
  "colors": ["color1", "color2"],
  "suggestedTransformations": ["transform1", "transform2"]
}`;

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text();

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  return JSON.parse(jsonMatch[0]) as ImageAnalysisResult;
}

/**
 * Get smart prompt suggestions for remove/recolor transformations
 */
export async function suggestPrompts(
  imageUrl: string,
  transformationType: "remove" | "recolor"
): Promise<PromptSuggestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Fetch image and convert to base64
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

  const imagePart: Part = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const prompt = transformationType === "remove"
    ? `Analyze this image and suggest 4-5 objects that could be removed to improve the image. 
       Focus on: distracting elements, unwanted objects, photobombers, text/watermarks, clutter.
       
       Respond in JSON array format:
       [
         {"label": "Display Name", "value": "prompt to use", "confidence": 0.9},
         ...
       ]`
    : `Analyze this image and suggest 4-5 objects that could be recolored with recommended colors.
       Focus on: clothing, accessories, vehicles, furniture, backgrounds.
       
       Respond in JSON array format:
       [
         {"label": "Blue Shirt", "value": "shirt", "suggestedColor": "navy blue", "confidence": 0.9},
         ...
       ]`;

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text();

  // Parse JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return [];
  }

  return JSON.parse(jsonMatch[0]) as PromptSuggestion[];
}

/**
 * AI Chat assistant for helping users with the app
 */
export async function chatWithAssistant(
  messages: ChatMessage[],
  currentContext?: { imageUrl?: string; transformationType?: string }
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are a helpful AI assistant for EditZen, an AI-powered image editing application. 
You help users with:
- Image restoration (removing noise/imperfections)
- Generative fill (extending image dimensions)
- Object removal (removing unwanted objects)
- Object recoloring (changing colors of objects)
- Background removal

IMPORTANT: Respond in plain text only. Do NOT use markdown formatting like asterisks, bullet points, or bold text. Keep responses short and conversational.

Be concise, friendly, and helpful. If users ask about features outside this scope, 
politely redirect them to the available editing features.

${currentContext?.transformationType ? `Current transformation: ${currentContext.transformationType}` : ""}`;

  const chatHistory = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood! I'm ready to help users with EditZen's image editing features." }] },
      ...chatHistory.slice(0, -1),
    ],
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);

  return result.response.text();
}
