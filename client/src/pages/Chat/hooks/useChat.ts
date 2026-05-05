import { useMemo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/shared/hooks/api/useApi";
import { useGetOne } from "@/shared/hooks/api/useGetOne";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { UserInterface } from "@/shared/interfaces/User.interface";
import {
  ChatHistoryResponse,
  ChatMessageInterface,
  SendMessageResponse,
} from "@/shared/interfaces/Chat.interface";

export function useChat() {
  const queryClient = useQueryClient();
  const chatApi = useApi(["chat"]);

  const user = useGetOne<UserInterface>({
    url: ["users", "me"],
    queryKey: QUERY_KEYS.USER_ME,
  });

  const dailyStats = useGetOne<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  }>({
    url: ["meals", "stats", "daily"],
    queryKey: QUERY_KEYS.DAILY_STATS(new Date().toISOString().slice(0, 10)),
    params: { date: new Date().toISOString().slice(0, 10) },
  });

  const historyQuery = useInfiniteQuery<
    ChatHistoryResponse,
    Error,
    { pages: ChatHistoryResponse[] },
    unknown[],
    string | undefined
  >({
    queryKey: [...QUERY_KEYS.CHAT_HISTORY],
    queryFn: ({ pageParam }) =>
      chatApi.get<ChatHistoryResponse>({
        before: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.messages[lastPage.messages.length - 1]?._id
        : undefined,
  });

  const sendMutation = useMutation<SendMessageResponse, Error, string>({
    mutationFn: (message) =>
      chatApi.mutate<SendMessageResponse>({ message }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        [...QUERY_KEYS.CHAT_HISTORY],
        (old: { pages: ChatHistoryResponse[] } | undefined) => {
          if (!old) return old;
          const updatedPages = [...old.pages];
          if (updatedPages.length > 0) {
            const firstPage = updatedPages[0];
            updatedPages[0] = {
              ...firstPage,
              messages: [data.aiMsg, data.userMsg, ...firstPage.messages],
            };
          }
          return { ...old, pages: updatedPages };
        }
      );
    },
  });

  const messages = useMemo<ChatMessageInterface[]>(() => {
    if (!historyQuery.data) return [];
    return [...historyQuery.data.pages]
      .reverse()
      .flatMap((page) => [...page.messages].reverse());
  }, [historyQuery.data]);

  const remainingCalories = useMemo(() => {
    const goal = user.data?.dailyCalorieGoal ?? 0;
    const eaten = dailyStats.data?.totalCalories ?? 0;
    return Math.max(0, goal - eaten);
  }, [user.data, dailyStats.data]);

  const smartSuggestionText = useMemo(() => {
    const eaten = dailyStats.data?.totalCalories ?? 0;
    const ateProtein = dailyStats.data?.totalProtein ?? 0;
    const ateCarbs = dailyStats.data?.totalCarbs ?? 0;
    const ateFat = dailyStats.data?.totalFat ?? 0;
    const goal = user.data?.dailyCalorieGoal ?? 0;
    const weight = user.data?.weight ?? 70;
    const proteinGoal = Math.round(weight * 2);
    const fatGoal = Math.round((goal * 0.25) / 9);
    const carbsGoal = Math.round((goal - proteinGoal * 4 - fatGoal * 9) / 4);
    const remaining = Math.max(0, goal - eaten);
    return (
      `Bugun ${Math.round(eaten)} kcal yedim (maqsad: ${goal} kcal, ${Math.round(remaining)} kcal qoldi). ` +
      `Kunlik makro maqsadlar: oqsil ${proteinGoal}g, uglevod ${carbsGoal}g, yog' ${fatGoal}g. ` +
      `Bugun yegan makrolar: oqsil ${Math.round(ateProtein)}g, uglevod ${Math.round(ateCarbs)}g, yog' ${Math.round(ateFat)}g. ` +
      `Kechki ovqat uchun nima tavsiya qilasiz?`
    );
  }, [user.data, dailyStats.data]);

  return {
    historyQuery,
    sendMutation,
    messages,
    user: user.data,
    remainingCalories,
    smartSuggestionText,
  };
}
