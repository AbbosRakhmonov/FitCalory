import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { PageWrapper } from "@/shared/components/templates/PageWrapper";
import { CameraCapture } from "./components/CameraCapture";
import { AiAnalysisResult } from "./components/AiAnalysisResult";
import { MyInput } from "@/shared/components/atoms/form/MyInput";
import { MySelect } from "@/shared/components/atoms/form/MySelect";
import { AiAnalysisInterface, FoodItemInterface } from "@/shared/interfaces/Meal.interface";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import request from "@/request";
import dayjs from "dayjs";

const MEAL_TYPES = [
  { value: "breakfast", label: "Nonushta" },
  { value: "lunch", label: "Tushlik" },
  { value: "dinner", label: "Kechki ovqat" },
  { value: "snack", label: "Snack" },
];

export function LogMeal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = dayjs().format("YYYY-MM-DD");

  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<AiAnalysisInterface | null>(null);
  const [foods, setFoods] = useState<FoodItemInterface[]>([]);
  const [note, setNote] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  const analyzeImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await request.post<{ data: AiAnalysisInterface }>("/ai/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAiResult(data);
      setFoods(data.foods);
      toast.success("Tahlil tayyor!");
    },
    onError: () => toast.error("AI tahlilida xatolik"),
  });

  const saveMeal = useMutation({
    mutationFn: () =>
      request.post("/meals", {
        date: new Date().toISOString(),
        mealType,
        note,
        foods,
        photo: uploadedPhoto,
        aiAnalysis: aiResult ? JSON.stringify(aiResult) : undefined,
        isManual: !capturedFile,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEALS_LIST(today) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_STATS(today) });
      toast.success("Taom saqlandi!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Saqlashda xatolik"),
  });

  const handleCapture = (file: File) => {
    setCapturedFile(file);
    const path = URL.createObjectURL(file);
    setUploadedPhoto(path);
    analyzeImage.mutate(file);
  };

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-100">Taom qo'shish</h1>
      </div>

      <MySelect
        label="Qaysi ovqat?"
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        options={MEAL_TYPES}
      />

      <CameraCapture onCapture={handleCapture} />

      {analyzeImage.isPending && (
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-800/60 py-8">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
          <span className="text-sm text-slate-300">AI tahlil qilmoqda...</span>
        </div>
      )}

      {aiResult && !analyzeImage.isPending && (
        <AiAnalysisResult result={aiResult} onFoodsChange={setFoods} />
      )}

      {!capturedFile && !analyzeImage.isPending && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-500 text-center">yoki qo'lda qo'shing</p>
          <button
            onClick={() => setFoods([{ name: "", quantity: "100g", calories: 0, protein: 0, carbs: 0, fat: 0 }])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-3 text-sm text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
          >
            <Sparkles size={16} />
            Qo'lda mahsulot kiritish
          </button>
        </div>
      )}

      <MyInput
        label="Izoh (ixtiyoriy)"
        placeholder="Masalan: Tushlikdan keyin..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {(foods.length > 0 || aiResult) && (
        <button
          onClick={() => saveMeal.mutate()}
          disabled={saveMeal.isPending || foods.length === 0}
          className="w-full rounded-xl bg-emerald-500 py-4 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
        >
          {saveMeal.isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      )}
    </PageWrapper>
  );
}
