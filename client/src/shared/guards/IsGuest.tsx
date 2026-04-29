import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/shared/store/useAuthStore";

export function IsGuest() {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
