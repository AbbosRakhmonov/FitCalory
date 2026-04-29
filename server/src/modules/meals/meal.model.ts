import mongoose, { Document, Schema } from "mongoose";

export interface IFoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface IMeal extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  photo?: string;
  note?: string;
  foods: IFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  aiAnalysis?: string;
  isManual: boolean;
}

const foodItemSchema = new Schema<IFoodItem>({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  fiber: Number,
});

const mealSchema = new Schema<IMeal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    photo: String,
    note: String,
    foods: [foodItemSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    aiAnalysis: String,
    isManual: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Meal = mongoose.model<IMeal>("Meal", mealSchema);
