import { Droplets, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WaterLogInterface } from "@/shared/interfaces/Water.interface";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import request from "@/request";
import dayjs from "dayjs";

interface Props {
  waterLog?: WaterLogInterface | null;
  goal: number;
}

const AMOUNTS = [150, 250, 350, 500];

export function WaterTracker({ waterLog, goal }: Props) {
  const queryClient = useQueryClient();
  const today = dayjs().format("YYYY-MM-DD");

  const addWater = useMutation({
    mutationFn: (amount: number) =>
      request.post("/water", { date: today, amount }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WATER(today) });
      toast.success("Suv qo'shildi!");
    },
  });

  const total = waterLog?.totalAmount || 0;
  const pct = Math.min((total / goal) * 100, 100);

  return (
    <div className="rounded-2xl bg-slate-800/60 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">Suv</span>
        </div>
        <span className="text-sm text-slate-400">
          {total} / {goal} ml
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-700">
        <div
          className="h-2 rounded-full bg-blue-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-2">
        {AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => addWater.mutate(amount)}
            disabled={addWater.isPending}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-700 py-2 text-xs font-medium text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
          >
            <Plus size={10} />
            {amount}ml
          </button>
        ))}
      </div>
    </div>
  );
}
