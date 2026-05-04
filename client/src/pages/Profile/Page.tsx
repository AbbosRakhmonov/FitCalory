import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogOut, Flame, Zap, Target } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageWrapper } from "@/shared/components/templates/PageWrapper";
import { MyInput } from "@/shared/components/atoms/form/MyInput";
import { MySelect } from "@/shared/components/atoms/form/MySelect";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { useUserStore } from "@/shared/store/useUserStore";
import { useProfile } from "./hooks/useProfile";

const schema = z.object({
  name: z.string().min(2).optional(),
  height: z.coerce.number().min(50).max(300).optional(),
  weight: z.coerce.number().min(20).max(500).optional(),
  age: z.coerce.number().min(10).max(120).optional(),
  gender: z.enum(["male", "female"]).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  dailyCalorieGoal: z.coerce.number().min(500).max(10000).optional(),
  dailyWaterGoal: z.coerce.number().min(500).max(10000).optional(),
  dietMode: z.enum(["cut", "maintain", "bulk"]).optional(),
});

type FormData = z.infer<typeof schema>;

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const clearAuth = useAuthStore((s) => s.clear);
  const clearUser = useUserStore((s) => s.clear);
  const { user, update } = useProfile();

  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watched = useWatch({ control });

  const bmr = useMemo(() => {
    const { height, weight, age, gender } = watched;
    if (!height || !weight || !age) return null;
    const base = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
    return Math.round(gender === "female" ? base - 161 : base + 5);
  }, [watched]);

  const clientTdee = useMemo(() => {
    if (!bmr || !watched.activityLevel) return null;
    return Math.round(bmr * (ACTIVITY_MULTIPLIERS[watched.activityLevel] ?? 1.55));
  }, [bmr, watched.activityLevel]);

  const targetCalories = useMemo(() => {
    if (!clientTdee) return null;
    if (watched.dietMode === "cut") return clientTdee - 500;
    if (watched.dietMode === "bulk") return clientTdee + 300;
    return clientTdee;
  }, [clientTdee, watched.dietMode]);

  useEffect(() => {
    if (user.data) reset(user.data as FormData);
  }, [user.data, reset]);

  function logout() {
    clearAuth();
    clearUser();
    navigate("/login");
  }

  function onSubmit(data: FormData) {
    update.mutate(data, {
      onSuccess: () => {
        if (isOnboarding) {
          navigate("/dashboard");
        } else {
          toast.success("Profil yangilandi!");
        }
      },
    });
  }

  return (
    <PageWrapper
      title={isOnboarding ? "Profilingizni sozlang" : "Profil"}
      subtitle={isOnboarding ? "TDEE to'g'ri hisoblashi uchun ma'lumotlaringizni kiriting" : undefined}
      action={
        !isOnboarding ? (
          <button onClick={logout} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300">
            <LogOut size={16} /> Chiqish
          </button>
        ) : undefined
      }
    >
      {isOnboarding && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-slate-300 leading-relaxed">
          Salom! Kunlik kaloriya maqsadingizni avtomatik hisoblash uchun quyidagi
          ma'lumotlarni to'ldiring. Bularni keyinchalik o'zgartirishingiz mumkin.
        </div>
      )}

      {bmr && clientTdee && (
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-slate-800/60 p-3">
            <Flame size={16} className="text-orange-400" />
            <span className="text-base font-bold text-slate-100">{bmr}</span>
            <span className="text-[10px] text-slate-500 text-center">BMR</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-slate-800/60 p-3">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-base font-bold text-slate-100">{clientTdee}</span>
            <span className="text-[10px] text-slate-500 text-center">TDEE</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3">
            <Target size={16} className="text-emerald-400" />
            <span className="text-base font-bold text-emerald-400">{targetCalories}</span>
            <span className="text-[10px] text-slate-500 text-center">
              {watched.dietMode === "cut" ? "Cut" : watched.dietMode === "bulk" ? "Bulk" : "Maqsad"}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {!isOnboarding && (
          <MyInput label="Ism" error={errors.name?.message} {...register("name")} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <MyInput label="Bo'y (sm)" type="number" placeholder="175" error={errors.height?.message} {...register("height")} />
          <MyInput label="Vazn (kg)" type="number" placeholder="70" error={errors.weight?.message} {...register("weight")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MyInput label="Yosh" type="number" placeholder="25" error={errors.age?.message} {...register("age")} />
          <MySelect
            label="Jins"
            options={[{ value: "male", label: "Erkak" }, { value: "female", label: "Ayol" }]}
            error={errors.gender?.message}
            {...register("gender")}
          />
        </div>

        <MySelect
          label="Faollik darajasi"
          options={[
            { value: "sedentary", label: "Kam harakatli (stol ishi)" },
            { value: "light", label: "Yengil (haftada 1-3 kun)" },
            { value: "moderate", label: "O'rtacha (haftada 3-5 kun)" },
            { value: "active", label: "Faol (haftada 6-7 kun)" },
            { value: "very_active", label: "Juda faol (sport)" },
          ]}
          error={errors.activityLevel?.message}
          {...register("activityLevel")}
        />

        <MySelect
          label="Maqsad"
          options={[
            { value: "cut", label: "Vazn yo'qotish (Cut)" },
            { value: "maintain", label: "Saqlash (Maintain)" },
            { value: "bulk", label: "Massa olish (Bulk)" },
          ]}
          error={errors.dietMode?.message}
          {...register("dietMode")}
        />

        {!isOnboarding && (
          <div className="grid grid-cols-2 gap-3">
            <MyInput label="Kunlik kcal maqsad" type="number" error={errors.dailyCalorieGoal?.message} {...register("dailyCalorieGoal")} />
            <MyInput label="Kunlik suv (ml)" type="number" error={errors.dailyWaterGoal?.message} {...register("dailyWaterGoal")} />
          </div>
        )}

        <button
          type="submit"
          disabled={(!isOnboarding && !isDirty) || update.isPending}
          className="mt-2 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {update.isPending
            ? "Saqlanmoqda..."
            : isOnboarding
            ? "Boshlash →"
            : "Saqlash"}
        </button>
      </form>

      {!isOnboarding && (
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={16} /> Hisobdan chiqish
        </button>
      )}
    </PageWrapper>
  );
}
