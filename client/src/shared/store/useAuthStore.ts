import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => {
        Cookies.set("refreshToken", refreshToken, { expires: 7, sameSite: "strict" });
        set({ accessToken, refreshToken });
      },
      clear: () => {
        Cookies.remove("refreshToken");
        set({ accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
    }
  )
);
