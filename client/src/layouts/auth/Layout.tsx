import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl shadow-xl shadow-emerald-500/30">
          🥗
        </div>
        <h1 className="text-2xl font-bold text-slate-100">FitCalory</h1>
        <p className="text-sm text-slate-400">AI-powered kaloria hisobchi</p>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
