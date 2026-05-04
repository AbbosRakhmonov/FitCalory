import { cn } from "@/shared/utils/cn";

interface Props {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color: string;
  barColor: string;
}

export function NutritionBadge({ label, value, max, unit = "g", color, barColor }: Props) {
  const pct = max ? Math.min((value / max) * 100, 100) : null;

  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-slate-800/60 px-4 py-3">
      <div className={cn("h-1.5 w-8 rounded-full", color)} />
      <span className="text-lg font-bold text-slate-100">
        {Math.round(value)}
        <span className="text-xs font-normal text-slate-400">{unit}</span>
      </span>
      {max ? (
        <span className="text-xs text-slate-500">
          / {max}
          {unit}
        </span>
      ) : null}
      <span className="text-xs text-slate-500">{label}</span>
      {pct !== null && (
        <div className="w-full rounded-full bg-slate-700 h-1 mt-0.5">
          <div
            className={cn("h-1 rounded-full transition-all", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
