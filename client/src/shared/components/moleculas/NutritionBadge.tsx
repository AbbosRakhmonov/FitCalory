import { cn } from "@/shared/utils/cn";

interface Props {
  label: string;
  value: number;
  unit?: string;
  color: string;
}

export function NutritionBadge({ label, value, unit = "g", color }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-slate-800/60 px-4 py-3">
      <div className={cn("h-1.5 w-8 rounded-full", color)} />
      <span className="text-lg font-bold text-slate-100">
        {Math.round(value)}
        <span className="text-xs font-normal text-slate-400">{unit}</span>
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
