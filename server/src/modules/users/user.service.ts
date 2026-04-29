import { User } from "./user.model";
import { UpdateProfileDto } from "./user.dto";

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select("-refreshToken -password -googleId");
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateProfile(userId: string, dto: UpdateProfileDto) {
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
