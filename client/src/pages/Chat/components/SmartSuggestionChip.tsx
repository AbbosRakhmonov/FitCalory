import { Zap } from "lucide-react";

interface Props {
  onTap: () => void;
  isLoading: boolean;
  eaten: number;
  goal: number;
  remaining: number;
}

export function SmartSuggestionChip({ onTap, isLoading, eaten, goal, remaining }: Props) {
  return (
    <button
      onClick={onTap}
      disabled={isLoading}
      className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 transition-colors hover:bg-emerald-500/15 disabled:opacity-50"
    >
      <Zap size={15} className="shrink-0 text-emerald-400" />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="text-sm font-medium text-emerald-400">Tavsiya ol</span>
        <span className="shrink-0 text-xs text-slate-400">
          {Math.round(eaten)} / {goal} kcal
          {remaining > 0 ? (
            <span className="ml-1 text-emerald-500">· {Math.round(remaining)} qoldi</span>
          ) : (
            <span className="ml-1 text-amber-400">· maqsad bajarildi</span>
          )}
        </span>
      </div>
    </button>
  );
}
