import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { PageWrapper } from "@/shared/components/templates/PageWrapper";
import { MealCard } from "@/shared/components/moleculas/MealCard";
import { EmptyState } from "@/shared/components/templates/EmptyState";
import { useGetAll } from "@/shared/hooks/api/useGetAll";
import { useGetOne } from "@/shared/hooks/api/useGetOne";
import { MealInterface, DailyStatsInterface } from "@/shared/interfaces/Meal.interface";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";

export function History() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  const meals = useGetAll<MealInterface>({
    url: ["meals"],
    queryKey: QUERY_KEYS.MEALS_LIST(selectedDate),
    params: { date: selectedDate },
  });

  const stats = useGetOne<DailyStatsInterface>({
    url: ["meals", "stats", "daily"],
    queryKey: QUERY_KEYS.DAILY_STATS(selectedDate),
    params: { date: selectedDate },
  });

  const prevDay = () => setSelectedDate(dayjs(selectedDate).subtract(1, "day").format("YYYY-MM-DD"));
  const nextDay = () => {
    const next = dayjs(selectedDate).add(1, "day");
    if (next.isBefore(dayjs().add(1, "day"))) {
      setSelectedDate(next.format("YYYY-MM-DD"));
    }
  };

  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");

  return (
    <PageWrapper title="Tarix">
      <div className="flex items-center justify-between rounded-2xl bg-slate-800/60 p-4">
        <button onClick={prevDay} className="rounded-xl p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-100">
            {isToday ? "Bugun" : dayjs(selectedDate).format("DD MMMM YYYY")}
          </p>
          {stats.data && (
            <p className="text-sm text-orange-400 font-medium mt-0.5">
              {stats.data.totalCalories} kcal · {stats.data.mealsCount} ta taom
            </p>
          )}
        </div>
        <button
          onClick={nextDay}
          disabled={isToday}
          className="rounded-xl p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {meals.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-slate-800/60 animate-pulse" />)}
        </div>
      ) : meals.data?.length ? (
        <div className="flex flex-col gap-3">
          {meals.data.map((meal) => <MealCard key={meal._id} meal={meal} />)}
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title="Bu kun uchun taom yo'q"
          description="Ovqat yeganingizni qayd qilishni boshlang"
        />
      )}
    </PageWrapper>
  );
}
