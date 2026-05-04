import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { useGetOne } from "@/shared/hooks/api/useGetOne";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { UserInterface } from "@/shared/interfaces/User.interface";

export function BaseLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const user = useGetOne<UserInterface>({
    url: ["users", "me"],
    queryKey: QUERY_KEYS.USER_ME,
  });

  useEffect(() => {
    if (user.isLoading || user.isFetching) return;
    if (
      user.data &&
      !user.data.height &&
      !user.data.weight &&
      !user.data.age &&
      pathname !== "/profile"
    ) {
      navigate("/profile?onboarding=true", { replace: true });
    }
  }, [user.data, user.isLoading, user.isFetching, pathname, navigate]);

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="mx-auto max-w-lg">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
