import { useRef, KeyboardEvent, ChangeEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSend();
    }
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        rows={1}
        placeholder="Savol yoki retsept so'rang..."
        className={cn(
          "flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500",
          "focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30",
          "disabled:opacity-50 transition-colors"
        )}
        style={{ minHeight: "44px", maxHeight: "120px" }}
      />
      <button
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className={cn(
          "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all",
          "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95",
          "disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </div>
  );
}
