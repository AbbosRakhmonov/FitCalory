import { Sparkles, AlertCircle } from "lucide-react";
import { AiAnalysisInterface, FoodItemInterface } from "@/shared/interfaces/Meal.interface";

interface Props {
  result: AiAnalysisInterface;
  onFoodsChange: (foods: FoodItemInterface[]) => void;
}

export function AiAnalysisResult({ result, onFoodsChange }: Props) {
  const confidenceColors = { high: "text-emerald-400", medium: "text-yellow-400", low: "text-red-400" };
  const confidenceLabels = { high: "Yuqori aniqlik", medium: "O'rtacha aniqlik", low: "Past aniqlik" };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-slate-800/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">AI tahlili</span>
        </div>
        <span className={`text-xs font-medium ${confidenceColors[result.confidence]}`}>
          {confidenceLabels[result.confidence]}
        </span>
      </div>

      {result.notes && (
        <div className="flex items-start gap-2 rounded-xl bg-slate-700/50 p-3">
          <AlertCircle size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400">{result.notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {result.foods.map((food, i) => (
          <div key={i} className="rounded-xl border border-slate-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-slate-100">{food.name}</p>
                <p className="text-xs text-slate-500">{food.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-orange-400">{food.calories} kcal</span>
            </div>
            <div className="flex gap-3 text-xs text-slate-500">
              <span>P: <span className="text-blue-400">{food.protein}g</span></span>
              <span>U: <span className="text-orange-400">{food.carbs}g</span></span>
              <span>Y: <span className="text-yellow-400">{food.fat}g</span></span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-700 pt-3">
        <span className="text-sm text-slate-400">Jami</span>
        <div className="flex gap-3 text-sm">
          <span className="text-orange-400 font-bold">{result.totalCalories} kcal</span>
          <span className="text-slate-500">P:{result.totalProtein}g C:{result.totalCarbs}g F:{result.totalFat}g</span>
        </div>
      </div>

      <button
        onClick={() => onFoodsChange(result.foods)}
        className="w-full rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
      >
        Mahsulotlarni tahrirlash
      </button>
    </div>
  );
}
