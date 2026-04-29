import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { routeConfig } from "./routeConfig";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  ...routeConfig,
]);

export function Router() {
  return <RouterProvider router={router} />;
}
