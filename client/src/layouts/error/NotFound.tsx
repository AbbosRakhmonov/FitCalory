import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-center">
      <span className="text-7xl">🥦</span>
      <h1 className="text-4xl font-bold text-slate-100">404</h1>
      <p className="text-slate-400">Bu sahifa topilmadi</p>
      <button
        onClick={() => navigate("/dashboard")}
        className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
      >
        Bosh sahifaga qaytish
      </button>
    </div>
  );
}
