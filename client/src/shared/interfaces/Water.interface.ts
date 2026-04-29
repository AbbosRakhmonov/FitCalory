export interface WaterEntryInterface {
  amount: number;
  time: string;
}

export interface WaterLogInterface {
  _id?: string;
  userId: string;
  date: string;
  entries: WaterEntryInterface[];
  totalAmount: number;
}
