import { lazy } from "react";

export const Dashboard = lazy(() =>
  import("@/pages/Dashboard/Page").then((m) => ({ default: m.Dashboard }))
);
export const LogMeal = lazy(() =>
  import("@/pages/Log-Meal/Page").then((m) => ({ default: m.LogMeal }))
);
export const History = lazy(() =>
  import("@/pages/History/Page").then((m) => ({ default: m.History }))
);
export const Progress = lazy(() =>
  import("@/pages/Progress/Page").then((m) => ({ default: m.Progress }))
);
export const Profile = lazy(() =>
  import("@/pages/Profile/Page").then((m) => ({ default: m.Profile }))
);
export const Chat = lazy(() =>
  import("@/pages/Chat/Page").then((m) => ({ default: m.Chat }))
);
export const Login = lazy(() =>
  import("@/layouts/auth/pages/Login").then((m) => ({ default: m.Login }))
);
export const Register = lazy(() =>
  import("@/layouts/auth/pages/Register").then((m) => ({ default: m.Register }))
);
