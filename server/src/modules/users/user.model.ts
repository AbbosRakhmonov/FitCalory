import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string;
  googleId?: string;
  name: string;
  avatar?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  dietMode: "cut" | "maintain" | "bulk";
  allowedFoods: string[];
  restrictedFoods: string[];
  refreshToken?: string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    googleId: String,
    name: { type: String, required: true },
    avatar: String,
    height: Number,
    weight: Number,
    age: Number,
    gender: { type: String, enum: ["male", "female"], default: "male" },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },
    dailyCalorieGoal: { type: Number, default: 2000 },
    dailyWaterGoal: { type: Number, default: 2500 },
    dietMode: { type: String, enum: ["cut", "maintain", "bulk"], default: "maintain" },
    allowedFoods: { type: [String], default: [] },
    restrictedFoods: { type: [String], default: [] },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password || "");
};

export const User = mongoose.model<IUser>("User", userSchema);
