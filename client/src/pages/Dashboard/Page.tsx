import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { PageWrapper } from "@/shared/components/templates/PageWrapper";
import { ProgressRing } from "@/shared/components/moleculas/ProgressRing";
import { NutritionBadge } from "@/shared/components/moleculas/NutritionBadge";
import { MealCard } from "@/shared/components/moleculas/MealCard";
import { EmptyState } from "@/shared/components/templates/EmptyState";
import { WaterTracker } from "./components/WaterTracker";
import { useDashboard } from "./hooks/useDashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { toast } from "sonner";
import request from "@/request";

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = dayjs().format("YYYY-MM-DD");
  const { user, dailyStats, meals, water } = useDashboard();
  const { data: waterLog } = water;

  const stats = dailyStats.data;
  const goal = user.data?.dailyCalorieGoal || 2000;
  const waterGoal = user.data?.dailyWaterGoal || 2500;
  const consumed = stats?.totalCalories || 0;
  const remaining = Math.max(goal - consumed, 0);

  const weight = user.data?.weight;
  const proteinGoal = weight ? Math.round(weight * 2) : null;
  const fatGoal = Math.round((goal * 0.25) / 9);
  const carbsGoal = proteinGoal
    ? Math.round((goal - proteinGoal * 4 - fatGoal * 9) / 4)
    : Math.round((goal * 0.5) / 4);

  const deleteMeal = useMutation({
    mutationFn: (id: string) => request.delete(`/meals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEALS_LIST(today) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_STATS(today) });
      toast.success("O'chirildi");
    },
  });

  return (
    <PageWrapper
      title={`Salom, ${user.data?.name?.split(" ")[0] || ""} 👋`}
      subtitle={dayjs().format("DD MMMM, dddd")}
      action={
        <button
          onClick={() => navigate("/log")}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Camera size={16} />
          Qo'shish
        </button>
      }
    >
      <div className="flex flex-col items-center gap-2 py-4">
        <ProgressRing
          value={consumed}
          max={goal}
          size={180}
          strokeWidth={14}
          label={`${consumed}`}
          sublabel="kcal yeyildi"
          color={consumed > goal ? "#f97316" : "#10b981"}
        />
        <p className="text-sm text-slate-400">
          {remaining > 0 ? (
            <span>Qoldi: <span className="font-semibold text-slate-200">{remaining} kcal</span></span>
          ) : (
            <span className="text-orange-400 font-medium">Kunlik me'yor bajarildi!</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NutritionBadge
          label="Oqsil"
          value={stats?.totalProtein || 0}
          max={proteinGoal ?? undefined}
          color="bg-blue-400"
          barColor="bg-blue-400"
        />
        <NutritionBadge
          label="Uglevodlar"
          value={stats?.totalCarbs || 0}
          max={carbsGoal}
          color="bg-orange-400"
          barColor="bg-orange-400"
        />
        <NutritionBadge
          label="Yog'"
          value={stats?.totalFat || 0}
          max={fatGoal}
          color="bg-yellow-400"
          barColor="bg-yellow-400"
        />
      </div>

      <WaterTracker waterLog={waterLog} goal={waterGoal} />

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-slate-200">Bugungi taomlar</h2>
        {meals.isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : meals.data?.length ? (
          <div className="flex flex-col gap-3">
            {meals.data.map((meal) => (
              <MealCard
                key={meal._id}
                meal={meal}
                onDelete={(id) => deleteMeal.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🥗"
            title="Hali taom qo'shilmagan"
            description="Bugungi birinchi taomingizni qo'shing"
            action={
              <button
                onClick={() => navigate("/log")}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
              >
                Taom qo'shish
              </button>
            }
          />
        )}
      </div>
    </PageWrapper>
  );
}
