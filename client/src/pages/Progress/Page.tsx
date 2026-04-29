import dayjs from "dayjs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { PageWrapper } from "@/shared/components/templates/PageWrapper";
import { useGetOne } from "@/shared/hooks/api/useGetOne";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { WeeklyStatsDayInterface } from "@/shared/interfaces/Meal.interface";
import { UserInterface } from "@/shared/interfaces/User.interface";

export function Progress() {
  const startDate = dayjs().subtract(6, "day").format("YYYY-MM-DD");

  const weeklyStats = useGetOne<WeeklyStatsDayInterface[]>({
    url: ["meals", "stats", "weekly"],
    queryKey: QUERY_KEYS.WEEKLY_STATS(startDate),
    params: { startDate },
  });

  const user = useGetOne<UserInterface>({
    url: ["users", "me"],
    queryKey: QUERY_KEYS.USER_ME,
  });

  const goal = user.data?.dailyCalorieGoal || 2000;

  const chartData = weeklyStats.data?.map((d) => ({
    date: dayjs(d.date).format("DD/MM"),
    kcal: d.calories,
    protein: Math.round(d.protein),
    carbs: Math.round(d.carbs),
    fat: Math.round(d.fat),
  })) || [];

  const avgCalories = chartData.length
    ? Math.round(chartData.reduce((s, d) => s + d.kcal, 0) / chartData.filter(d => d.kcal > 0).length || 0)
    : 0;

  const daysOnTrack = chartData.filter((d) => d.kcal > 0 && d.kcal <= goal).length;

  return (
    <PageWrapper title="Progress" subtitle="Haftalik ko'rsatkichlar">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-800/60 p-4">
          <p className="text-xs text-slate-500">O'rtacha kcal</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{avgCalories || "—"}</p>
          <p className="text-xs text-slate-500 mt-0.5">7 kun ichida</p>
        </div>
        <div className="rounded-2xl bg-slate-800/60 p-4">
          <p className="text-xs text-slate-500">Me'yor bajarilgan</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{daysOnTrack}<span className="text-sm text-slate-400">/7</span></p>
          <p className="text-xs text-slate-500 mt-0.5">kun</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Kaloriya trendi</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px" }}
              labelStyle={{ color: "#94a3b8" }}
              itemStyle={{ color: "#10b981" }}
            />
            <Line
              type="monotone"
              dataKey="kcal"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Makronutrientlar (g)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px" }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Bar dataKey="protein" name="Oqsil" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="carbs" name="Uglevodlar" fill="#fb923c" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fat" name="Yog'" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  );
}
