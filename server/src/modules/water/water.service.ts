import { WaterLog } from "./water.model";

export async function getWaterLog(userId: string, date: string) {
  return WaterLog.findOne({ userId, date }) || { userId, date, entries: [], totalAmount: 0 };
}

export async function addWaterEntry(userId: string, date: string, amount: number) {
  const entry = { amount, time: new Date() };
  const log = await WaterLog.findOneAndUpdate(
    { userId, date },
    { $push: { entries: entry }, $inc: { totalAmount: amount } },
    { new: true, upsert: true }
  );
  return log;
}

export async function resetWaterLog(userId: string, date: string) {
  await WaterLog.findOneAndUpdate({ userId, date }, { entries: [], totalAmount: 0 });
}
