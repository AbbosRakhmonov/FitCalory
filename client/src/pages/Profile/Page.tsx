import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogOut, Calculator } from "lucide-react";
import { PageWrapper } from "@/shared/components/templates/PageWrapper";
import { MyInput } from "@/shared/components/atoms/form/MyInput";
import { MySelect } from "@/shared/components/atoms/form/MySelect";
import { useGetOne } from "@/shared/hooks/api/useGetOne";
import { useMutate } from "@/shared/hooks/api/useMutate";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { UserInterface } from "@/shared/interfaces/User.interface";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { useUserStore } from "@/shared/store/useUserStore";
import { useNavigate } from "react-router-dom";

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

export function Profile() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clear);
  const clearUser = useUserStore((s) => s.clear);

  const user = useGetOne<UserInterface>({
    url: ["users", "me"],
    queryKey: QUERY_KEYS.USER_ME,
  });

  const tdee = useGetOne<{ tdee: number }>({
    url: ["users", "me", "tdee"],
    queryKey: QUERY_KEYS.USER_TDEE,
    options: { enabled: !!user.data?.height },
  });

  const updateProfile = useMutate<UserInterface, FormData>({
    url: ["users", "me"],
    method: "put",
    invalidateKeys: [QUERY_KEYS.USER_ME, QUERY_KEYS.USER_TDEE],
    options: { onSuccess: () => toast.success("Profil yangilandi!") },
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user.data) reset(user.data as FormData);
  }, [user.data, reset]);

  function logout() {
    clearAuth();
    clearUser();
    navigate("/login");
  }

  return (
    <PageWrapper
      title="Profil"
      action={
        <button onClick={logout} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300">
          <LogOut size={16} /> Chiqish
        </button>
      }
    >
      {tdee.data && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <Calculator size={20} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-200">Sizning TDEE: <span className="text-emerald-400 font-bold">{tdee.data.tdee} kcal</span></p>
            <p className="text-xs text-slate-500 mt-0.5">Kunlik energiya sarfi (Mifflin-St Jeor)</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((data) => updateProfile.mutate(data))} className="flex flex-col gap-4">
        <MyInput label="Ism" error={errors.name?.message} {...register("name")} />

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

        <div className="grid grid-cols-2 gap-3">
          <MyInput label="Kunlik kcal maqsad" type="number" error={errors.dailyCalorieGoal?.message} {...register("dailyCalorieGoal")} />
          <MyInput label="Kunlik suv (ml)" type="number" error={errors.dailyWaterGoal?.message} {...register("dailyWaterGoal")} />
        </div>

        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="mt-2 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {updateProfile.isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </PageWrapper>
  );
}
