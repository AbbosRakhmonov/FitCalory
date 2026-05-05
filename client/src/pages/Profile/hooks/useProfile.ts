import { useGetOne } from "@/shared/hooks/api/useGetOne";
import { useMutate } from "@/shared/hooks/api/useMutate";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { UserInterface } from "@/shared/interfaces/User.interface";
import { useUserStore } from "@/shared/store/useUserStore";

export interface UpdateProfileDto {
  name?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: "male" | "female";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dailyCalorieGoal?: number;
  dailyWaterGoal?: number;
  dietMode?: "cut" | "maintain" | "bulk";
  allowedFoods?: string[];
  restrictedFoods?: string[];
}

export function useProfile() {
  const setUser = useUserStore((s) => s.setUser);

  const user = useGetOne<UserInterface>({
    url: ["users", "me"],
    queryKey: QUERY_KEYS.USER_ME,
  });

  const tdee = useGetOne<{ tdee: number }>({
    url: ["users", "me", "tdee"],
    queryKey: QUERY_KEYS.USER_TDEE,
    options: { enabled: !!(user.data?.height && user.data?.weight && user.data?.age) },
  });

  const update = useMutate<UserInterface, UpdateProfileDto>({
    url: ["users", "me"],
    method: "put",
    invalidateKeys: [QUERY_KEYS.USER_ME, QUERY_KEYS.USER_TDEE],
    options: { onSuccess: (data) => setUser(data) },
  });

  return { user, tdee, update };
}
