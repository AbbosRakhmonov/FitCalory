import { Flame, Pencil, Trash2 } from "lucide-react";
import { MealInterface } from "@/shared/interfaces/Meal.interface";
import { config } from "@/shared/utils/config";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Nonushta",
  lunch: "Tushlik",
  dinner: "Kechki ovqat",
  snack: "Snack",
};

interface Props {
  meal: MealInterface;
  onEdit?: (meal: MealInterface) => void;
  onDelete?: (id: string) => void;
}

export function MealCard({ meal, onEdit, onDelete }: Props) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-800/60 p-3">
      {meal.photo ? (
        <img
          src={`${config.uploadsUrl}/${meal.photo.split("/").pop()}`}
          alt="meal"
          className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700 text-2xl">
          🍽️
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-emerald-400">
            {MEAL_LABELS[meal.mealType]}
          </span>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(meal)}
                className="rounded-lg p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(meal._id)}
                className="rounded-lg p-1 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm font-medium text-slate-100 truncate">
          {meal.foods.map((f) => f.name).join(", ")}
        </p>
        {meal.note && <p className="text-xs text-slate-500 truncate">{meal.note}</p>}
        <div className="flex items-center gap-1 text-orange-400">
          <Flame size={13} />
          <span className="text-sm font-semibold">{meal.totalCalories} kcal</span>
          <span className="text-xs text-slate-500 ml-1">
            P:{meal.totalProtein}g · C:{meal.totalCarbs}g · F:{meal.totalFat}g
          </span>
        </div>
      </div>
    </div>
  );
}
