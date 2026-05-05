import { NavLink, useNavigate } from "react-router-dom";
import { Home, CalendarDays, TrendingUp, User, Plus, Bot } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Bosh" },
  { to: "/history", icon: CalendarDays, label: "Tarix" },
  { to: "/chat", icon: Bot, label: "AI" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
              )
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          onClick={() => navigate("/log")}
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition-all"
        >
          <Plus size={26} className="text-white" />
        </button>

        {navItems.slice(2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
              )
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
