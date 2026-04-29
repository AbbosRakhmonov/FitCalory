import mongoose, { Document, Schema } from "mongoose";

export interface IWaterEntry {
  amount: number;
  time: Date;
}

export interface IWaterLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  entries: IWaterEntry[];
  totalAmount: number;
}

const waterLogSchema = new Schema<IWaterLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    entries: [{ amount: Number, time: { type: Date, default: Date.now } }],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

waterLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const WaterLog = mongoose.model<IWaterLog>("WaterLog", waterLogSchema);
