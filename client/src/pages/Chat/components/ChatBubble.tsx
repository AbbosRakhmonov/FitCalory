import { Fragment } from "react";
import { cn } from "@/shared/utils/cn";
import { ChatMessageInterface } from "@/shared/interfaces/Chat.interface";

interface Props {
  message: ChatMessageInterface;
}

function formatContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return <Fragment key={j}>{part}</Fragment>;
    });
    return (
      <Fragment key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </Fragment>
    );
  });
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm">
          🤖
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm border-emerald-500/30 bg-emerald-500/15 text-slate-100"
            : "rounded-tl-sm border-slate-700 bg-slate-800 text-slate-200"
        )}
      >
        <p className="whitespace-pre-wrap">{formatContent(message.content)}</p>
        <p
          className={cn(
            "mt-1.5 text-[10px]",
            isUser ? "text-right text-emerald-400/60" : "text-left text-slate-500"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
