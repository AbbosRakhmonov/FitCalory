import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic();

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AiAnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: "high" | "medium" | "low";
  notes: string;
}

const PROMPT = `You are a professional nutritionist AI. Analyze this food image and return ONLY valid JSON with no markdown or extra text:
{
  "foods": [
    {
      "name": "food name in English",
      "quantity": "estimated portion (e.g. '200g', '1 cup', '1 piece')",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "confidence": "high",
  "notes": "brief analysis notes"
}
All numeric values must be in grams for macros and kcal for calories. Be as accurate as possible.`;

export async function analyzeFoodImage(imagePath: string): Promise<AiAnalysisResult> {
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString("base64");
  const ext = imagePath.split(".").pop()?.toLowerCase();
  const mimeTypeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/jpeg",
  };
  const mediaType = (mimeTypeMap[ext || "jpg"] || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/gif";

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const text = (response.content[0] as { text: string }).text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned invalid response");
  return JSON.parse(jsonMatch[0]);
}
