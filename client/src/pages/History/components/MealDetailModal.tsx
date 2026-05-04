import { X, Flame, UtensilsCrossed } from "lucide-react";
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
  onClose: () => void;
}

export function MealDetailModal({ meal, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-emerald-400">
              {MEAL_LABELS[meal.mealType]}
            </p>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">
              {meal.foods.map((f) => f.name).join(", ") || "Taom"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {meal.photo && (
            <img
              src={`${config.uploadsUrl}/${meal.photo.split(/[\\/]/).pop()}`}
              alt="meal"
              className="w-full rounded-2xl object-cover max-h-64"
            />
          )}

          {meal.note && (
            <div className="rounded-2xl bg-slate-800/60 p-4">
              <p className="text-xs text-slate-500 mb-1">Izoh</p>
              <p className="text-sm text-slate-300">{meal.note}</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: "Kaloriya",
                value: `${meal.totalCalories}`,
                unit: "kcal",
                color: "text-orange-400",
              },
              {
                label: "Oqsil",
                value: `${meal.totalProtein}`,
                unit: "g",
                color: "text-blue-400",
              },
              {
                label: "Uglevodlar",
                value: `${meal.totalCarbs}`,
                unit: "g",
                color: "text-yellow-400",
              },
              {
                label: "Yog'",
                value: `${meal.totalFat}`,
                unit: "g",
                color: "text-red-400",
              },
            ].map(({ label, value, unit, color }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl bg-slate-800/60 py-3"
              >
                <span className={`text-base font-bold ${color}`}>{value}</span>
                <span className="text-[10px] text-slate-500">{unit}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {meal.foods.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Mahsulotlar
              </p>
              {meal.foods.map((food, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {food.name}
                    </p>
                    <p className="text-xs text-slate-500">{food.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame size={13} />
                      <span className="text-sm font-semibold">
                        {food.calories}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      P:{food.protein} · U:{food.carbs} · Y:{food.fat}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-slate-500">
              <UtensilsCrossed size={32} className="opacity-40" />
              <p className="text-sm">Mahsulot ma'lumotlari yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
