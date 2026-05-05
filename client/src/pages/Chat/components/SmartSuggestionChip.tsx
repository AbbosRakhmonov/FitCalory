import { Zap } from "lucide-react";

interface Props {
  onTap: () => void;
  isLoading: boolean;
}

export function SmartSuggestionChip({ onTap, isLoading }: Props) {
  return (
    <button
      onClick={onTap}
      disabled={isLoading}
      className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/15 disabled:opacity-50"
    >
      <Zap size={15} />
      Bugungi kaloriyaga mos tavsiya ol
    </button>
  );
}
