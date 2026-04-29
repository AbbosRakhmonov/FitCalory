import dayjs from "dayjs";
import { useGetOne } from "@/shared/hooks/api/useGetOne";
import { useGetAll } from "@/shared/hooks/api/useGetAll";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { DailyStatsInterface, MealInterface } from "@/shared/interfaces/Meal.interface";
import { WaterLogInterface } from "@/shared/interfaces/Water.interface";
import { UserInterface } from "@/shared/interfaces/User.interface";

const today = dayjs().format("YYYY-MM-DD");

export function useDashboard() {
  const user = useGetOne<UserInterface>({
    url: ["users", "me"],
    queryKey: QUERY_KEYS.USER_ME,
  });

  const dailyStats = useGetOne<DailyStatsInterface>({
    url: ["meals", "stats", "daily"],
    queryKey: QUERY_KEYS.DAILY_STATS(today),
    params: { date: today },
  });

  const meals = useGetAll<MealInterface>({
    url: ["meals"],
    queryKey: QUERY_KEYS.MEALS_LIST(today),
    params: { date: today },
  });

  const water = useGetOne<WaterLogInterface>({
    url: ["water", today],
    queryKey: QUERY_KEYS.WATER(today),
  });

  return { user, dailyStats, meals, water, today };
}
