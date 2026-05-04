import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
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

type Phase = "input" | "analyzing" | "review";

async function analyzeFiles(files: File[], note: string): Promise<AiAnalysisInterface> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  if (note.trim()) formData.append("note", note.trim());
  const res = await request.post<{ data: AiAnalysisInterface }>("/ai/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export function LogMeal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = dayjs().format("YYYY-MM-DD");

  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [phase, setPhase] = useState<Phase>("input");
  const [foods, setFoods] = useState<FoodItemInterface[]>([]);
  const [aiResult, setAiResult] = useState<AiAnalysisInterface | null>(null);

  const canSubmit = files.length > 0 || note.trim().length > 0;
  const hasFiles = files.length > 0;

  const saveMeal = useMutation({
    mutationFn: () =>
      request.post("/meals", {
        date: new Date().toISOString(),
        mealType,
        note,
        foods,
        photo: aiResult?.photo ?? undefined,
        aiAnalysis: aiResult ? JSON.stringify(aiResult) : undefined,
        isManual: !hasFiles,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEALS_LIST(today) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_STATS(today) });
      toast.success("Taom saqlandi!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Saqlashda xatolik"),
  });

  async function handleAnalyze() {
    if (!canSubmit) return;

    if (!hasFiles) {
      saveMeal.mutate();
      return;
    }

    setPhase("analyzing");
    try {
      const result = await analyzeFiles(files, note);
      setAiResult(result);
      setFoods(result.foods);
      setPhase("review");
    } catch {
      toast.error("AI tahlilida xatolik");
      setPhase("input");
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => (phase === "review" ? setPhase("input") : navigate(-1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-100">
          {phase === "review" ? "Natijani tekshiring" : "Taom qo'shish"}
        </h1>
      </div>

      {phase === "review" ? (
        <>
          {aiResult && (
            <AiAnalysisResult result={aiResult} onFoodsChange={setFoods} />
          )}

          {note.trim() && (
            <div className="rounded-2xl bg-slate-800/60 p-4 text-sm text-slate-300">
              <span className="text-xs text-slate-500 block mb-1">Izoh</span>
              {note}
            </div>
          )}

          <button
            onClick={() => saveMeal.mutate()}
            disabled={saveMeal.isPending}
            className="w-full rounded-xl bg-emerald-500 py-4 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
          >
            {saveMeal.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </>
      ) : (
        <>
          <MySelect
            label="Qaysi ovqat?"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            options={MEAL_TYPES}
          />

          <CameraCapture onFilesChange={setFiles} disabled={phase === "analyzing"} />

          <MyInput
            label={hasFiles ? "Izoh (ixtiyoriy)" : "Izoh (majburiy, rasm yo'q)"}
            placeholder="Masalan: Tushlikdan keyin..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {phase === "analyzing" ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-800/60 py-5">
              <Loader2 size={22} className="animate-spin text-emerald-400" />
              <span className="text-sm text-slate-300">
                {files.length > 1
                  ? `${files.length} ta rasm yuklanyapti...`
                  : "Rasm tahlil qilinyapti..."}
              </span>
            </div>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit}
              className="w-full rounded-xl bg-emerald-500 py-4 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-40 transition-colors shadow-lg shadow-emerald-500/20"
            >
              {hasFiles ? "Tahlil qilish" : "Saqlash"}
            </button>
          )}

          {!canSubmit && (
            <p className="text-center text-xs text-slate-500">
              Rasm yuklang yoki izoh kiriting
            </p>
          )}
        </>
      )}
    </PageWrapper>
  );
}
