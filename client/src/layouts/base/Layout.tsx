import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";

export function BaseLayout() {
  return (
    <div className="min-h-screen bg-slate-900">
      <main className="mx-auto max-w-lg">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
