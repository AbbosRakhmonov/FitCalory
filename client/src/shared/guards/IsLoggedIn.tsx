import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/shared/store/useAuthStore";

export function IsLoggedIn() {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
