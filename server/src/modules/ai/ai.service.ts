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
    ? `\nFoydalanuvchi izohi: "${note.trim()}"\nAgar izohda miqdor ko'rsatilgan bo'lsa (masalan "20g", "1 piyola"), rasmdan ko'ra IZOHNI ustun qo'y va shu miqdorni ishlat.`
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

export async function chatWithFoodAI(params: {
  userMessage: string;
  history: { role: "user" | "assistant"; content: string }[];
  userContext: {
    name: string;
    age: number;
    weight: number;
    height: number;
    dailyCalorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    todayCalories: number;
    todayProtein: number;
    todayCarbs: number;
    todayFat: number;
    allowedFoods: string[];
    restrictedFoods: string[];
  };
}): Promise<string> {
  const { userMessage, history, userContext } = params;
  const remainingCal = Math.max(0, userContext.dailyCalorieGoal - userContext.todayCalories);
  const remainingProtein = Math.max(0, userContext.proteinGoal - userContext.todayProtein);
  const remainingCarbs = Math.max(0, userContext.carbsGoal - userContext.todayCarbs);
  const remainingFat = Math.max(0, userContext.fatGoal - userContext.todayFat);

  const systemInstruction = `Siz FitCalory ilovasining AI ovqatlanish yordamchisisiz.
Foydalanuvchi: ${userContext.name}, ${userContext.age} yosh, ${userContext.weight}kg, ${userContext.height}cm

Kunlik maqsadlar:
  Kaloriya: ${userContext.dailyCalorieGoal} kcal | Oqsil: ${userContext.proteinGoal}g | Uglevod: ${userContext.carbsGoal}g | Yog': ${userContext.fatGoal}g

Bugun yegan:
  Kaloriya: ${Math.round(userContext.todayCalories)} kcal | Oqsil: ${Math.round(userContext.todayProtein)}g | Uglevod: ${Math.round(userContext.todayCarbs)}g | Yog': ${Math.round(userContext.todayFat)}g

Qolgan:
  Kaloriya: ${Math.round(remainingCal)} kcal | Oqsil: ${Math.round(remainingProtein)}g | Uglevod: ${Math.round(remainingCarbs)}g | Yog': ${Math.round(remainingFat)}g${
    userContext.restrictedFoods.length
      ? `\n\nTaqiqlangan mahsulotlar: ${userContext.restrictedFoods.join(", ")}`
      : ""
  }${
    userContext.allowedFoods.length
      ? `\nAfzal mahsulotlar: ${userContext.allowedFoods.join(", ")}`
      : ""
  }

Har doim o'zbek tilida, qisqa va aniq javob bering. Retsept bersangiz taxminiy kaloriya va makrolarni ham qo'shing.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
  });

  const geminiHistory = history.map((msg) => ({
    role: (msg.role === "assistant" ? "model" : "user") as "user" | "model",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(userMessage);
  return result.response.text().trim();
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
