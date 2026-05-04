import { User } from "./user.model";
import { UpdateProfileDto } from "./user.dto";

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select("-refreshToken -password -googleId");
  if (!user) throw new Error("User not found");
  return user;
}

const DIET_MODE_OFFSETS = { cut: -500, maintain: 0, bulk: 300 };

export async function updateProfile(userId: string, dto: UpdateProfileDto) {
  const current = await User.findById(userId);
  if (!current) throw new Error("User not found");

  const merged = { ...current.toObject(), ...dto };
  const { height, weight, age, gender, activityLevel, dietMode } = merged;

  if (height && weight && age && gender && activityLevel && !dto.dailyCalorieGoal) {
    const tdee = calculateTDEE(weight, height, age, gender, activityLevel);
    dto = { ...dto, dailyCalorieGoal: tdee + DIET_MODE_OFFSETS[dietMode ?? "maintain"] };
  }

  const user = await User.findByIdAndUpdate(userId, dto, { new: true, runValidators: true }).select(
    "-refreshToken -password -googleId"
  );
  if (!user) throw new Error("User not found");
  return user;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS
) {
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}
