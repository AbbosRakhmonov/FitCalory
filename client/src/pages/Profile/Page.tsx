import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogOut, Flame, Zap, Target, Plus, X } from "lucide-react";
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

  const [allowedFoods, setAllowedFoods] = useState<string[]>([]);
  const [restrictedFoods, setRestrictedFoods] = useState<string[]>([]);
  const [allowedInput, setAllowedInput] = useState("");
  const [restrictedInput, setRestrictedInput] = useState("");

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
    if (user.data) {
      reset(user.data as FormData);
      setAllowedFoods(user.data.allowedFoods ?? []);
      setRestrictedFoods(user.data.restrictedFoods ?? []);
    }
  }, [user.data, reset]);

  function logout() {
    clearAuth();
    clearUser();
    navigate("/login");
  }

  function addTag(
    type: "allowed" | "restricted",
    input: string,
    setInput: (v: string) => void
  ) {
    const tag = input.trim();
    if (!tag) return;
    if (type === "allowed") {
      setAllowedFoods((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    } else {
      setRestrictedFoods((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    }
    setInput("");
  }

  function removeTag(type: "allowed" | "restricted", idx: number) {
    if (type === "allowed") {
      setAllowedFoods((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setRestrictedFoods((prev) => prev.filter((_, i) => i !== idx));
    }
  }

  function onSubmit(data: FormData) {
    update.mutate({ ...data, allowedFoods, restrictedFoods }, {
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

        {!isOnboarding && (
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4">
            <p className="text-sm font-semibold text-slate-200">AI Ovqat Sozlamalari</p>

            <FoodTagInput
              label="Afzal mahsulotlar"
              placeholder="Masalan: tovuq, tuxum..."
              tags={allowedFoods}
              inputValue={allowedInput}
              onInputChange={setAllowedInput}
              onAdd={() => addTag("allowed", allowedInput, setAllowedInput)}
              onRemove={(i) => removeTag("allowed", i)}
              tagColor="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            />

            <FoodTagInput
              label="Taqiqlangan mahsulotlar"
              placeholder="Masalan: gluten, sut..."
              tags={restrictedFoods}
              inputValue={restrictedInput}
              onInputChange={setRestrictedInput}
              onAdd={() => addTag("restricted", restrictedInput, setRestrictedInput)}
              onRemove={(i) => removeTag("restricted", i)}
              tagColor="bg-red-500/15 text-red-400 border-red-500/30"
            />
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

function FoodTagInput({
  label,
  placeholder,
  tags,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  tagColor,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  tagColor: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={onAdd}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs ${tagColor}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="ml-0.5 opacity-70 hover:opacity-100"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
