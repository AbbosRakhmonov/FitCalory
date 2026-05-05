import { useState, useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { ChatBubble } from "./components/ChatBubble";
import { ChatInput } from "./components/ChatInput";
import { SmartSuggestionChip } from "./components/SmartSuggestionChip";
import { useChat } from "./hooks/useChat";
import { ChatMessageInterface } from "@/shared/interfaces/Chat.interface";

export function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [optimisticMsg, setOptimisticMsg] = useState<ChatMessageInterface | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const {
    historyQuery,
    sendMutation,
    messages,
    user,
    remainingCalories,
    smartSuggestionText,
  } = useChat();

  const allMessages = optimisticMsg
    ? [...messages, optimisticMsg]
    : messages;

  const isLoading = sendMutation.isPending;

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }

  useEffect(() => {
    if (messages.length > 0 && isFirstLoad.current) {
      scrollToBottom("instant");
      isFirstLoad.current = false;
    }
  }, [messages.length]);

  useEffect(() => {
    if (!isFirstLoad.current) {
      scrollToBottom("smooth");
    }
  }, [allMessages.length]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          historyQuery.hasNextPage &&
          !historyQuery.isFetchingNextPage
        ) {
          const container = sentinel.parentElement;
          const prevScrollHeight = container?.scrollHeight ?? 0;
          historyQuery.fetchNextPage().then(() => {
            if (container) {
              const diff = container.scrollHeight - prevScrollHeight;
              container.scrollTop += diff;
            }
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [historyQuery.hasNextPage, historyQuery.isFetchingNextPage, historyQuery.fetchNextPage]);

  function handleSend(text?: string) {
    const msg = text ?? inputValue.trim();
    if (!msg || isLoading) return;

    setInputValue("");
    setOptimisticMsg({
      _id: `opt-${Date.now()}`,
      userId: "",
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    });

    sendMutation.mutate(msg, {
      onSettled: () => setOptimisticMsg(null),
    });
  }

  const isEmpty = messages.length === 0 && !optimisticMsg;

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 px-4 pb-3 pt-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20">
              <Bot size={18} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">AI Yordamchi</h1>
              {user && (
                <p className="text-xs text-slate-400">
                  {remainingCalories > 0
                    ? `${Math.round(remainingCalories)} kcal qoldi`
                    : "Kunlik maqsad bajarildi ✓"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 pb-[160px]">
        {/* Top sentinel for loading older messages */}
        <div ref={topSentinelRef} className="h-1" />

        {historyQuery.isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        )}

        {historyQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Bot size={32} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-300">Salom, {user?.name ?? "Foydalanuvchi"}!</p>
              <p className="mt-1 text-sm text-slate-500">
                Ovqat, retsept yoki kaloriya haqida so'rang
              </p>
            </div>
          </div>
        ) : (
          allMessages.map((msg) => <ChatBubble key={msg._id} message={msg} />)
        )}

        {isLoading && (
          <div className="flex gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm">
              🤖
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-slate-700 bg-slate-800 px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-slate-500"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Fixed input area above BottomNav */}
      <div className="fixed bottom-[73px] left-0 right-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-3">
          {isEmpty && (
            <SmartSuggestionChip
              onTap={() => handleSend(smartSuggestionText)}
              isLoading={isLoading}
            />
          )}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSend()}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
