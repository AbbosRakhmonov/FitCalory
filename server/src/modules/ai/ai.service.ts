import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { env } from "../../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiAnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: "high" | "medium" | "low";
  notes: string;
}

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/jpeg",
};

function buildPrompt(note?: string): string {
  const noteSection = note?.trim()
    ? `\nFoydalanuvchi izohi (bunga asoslanib tahlil qil): "${note.trim()}"`
    : "";

  return `Sen professional dietolog sun'iy intellektsiyasan. Yuborilgan rasm(lar)dagi taomlarni tahlil qil.${noteSection}

Muhim qoidalar:
- Agar bir nechta rasm bo'lsa, ular bir xil taomning turli rakurslari yoki bir xonaning turli ovqatlari bo'lishi mumkin — bir xil mahsulotni IKKI MARTA yozma
- Barcha mahsulot nomlarini O'ZBEK tilida yoz
- Faqat quyidagi JSON formatida javob qaytar, boshqa hech narsa yozma:

{
  "foods": [
    {
      "name": "mahsulot nomi o'zbekcha",
      "quantity": "taxminiy miqdor (masalan: '200g', '1 piyola', '1 bo'lak')",
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
  "notes": "qisqacha tahlil izohi o'zbekcha"
}

Makrolar gramda, kaloriya kcal da bo'lsin. Iloji boricha aniq bo'l.`;
}

function buildTextPrompt(note: string): string {
  return `Sen professional dietolog sun'iy intellektsiyasan. Foydalanuvchi quyidagi taomni yeganligi haqida yozdi:

"${note}"

Ushbu matn asosida taomlarni tahlil qil va taxminiy kaloriya hamda makrolarni hisobla.

Muhim qoidalar:
- Faqat matnda aytilgan mahsulotlarni yoz
- Miqdor ko'rsatilmagan bo'lsa, o'rtacha porsiya hajmini qabul qil
- Barcha mahsulot nomlarini O'ZBEK tilida yoz
- Faqat quyidagi JSON formatida javob qaytar, boshqa hech narsa yozma:

{
  "foods": [
    {
      "name": "mahsulot nomi o'zbekcha",
      "quantity": "taxminiy miqdor",
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
  "confidence": "medium",
  "notes": "matn asosida taxminiy hisob"
}

Makrolar gramda, kaloriya kcal da bo'lsin.`;
}

export async function analyzeFoodText(note: string): Promise<AiAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(buildTextPrompt(note));
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI noto'g'ri javob qaytardi");
  return JSON.parse(jsonMatch[0]);
}

export async function analyzeFoodImages(
  imagePaths: string[],
  note?: string
): Promise<AiAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const imageParts = imagePaths.map((imagePath) => {
    const ext = imagePath.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType = MIME_TYPES[ext] ?? "image/jpeg";
    const base64 = fs.readFileSync(imagePath).toString("base64");
    return { inlineData: { data: base64, mimeType } };
  });

  const result = await model.generateContent([...imageParts, buildPrompt(note)]);

  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI noto'g'ri javob qaytardi");
  return JSON.parse(jsonMatch[0]);
}
