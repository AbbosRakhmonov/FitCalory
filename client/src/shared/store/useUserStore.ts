import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserInterface } from "@/shared/interfaces/User.interface";

interface UserState {
  user: UserInterface | null;
  setUser: (user: UserInterface) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    { name: "user-store" }
  )
);
