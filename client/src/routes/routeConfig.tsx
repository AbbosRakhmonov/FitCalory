import { RouteObject } from "react-router-dom";
import { BaseLayout } from "@/layouts/base/Layout";
import { AuthLayout } from "@/layouts/auth/Layout";
import { NotFound } from "@/layouts/error/NotFound";
import { IsLoggedIn } from "@/shared/guards/IsLoggedIn";
import { IsGuest } from "@/shared/guards/IsGuest";
import { Wrap } from "./Wrap";
import {
  Dashboard, LogMeal, History, Progress, Profile,
  Login, Register,
} from "./routeComponents";

export const routeConfig: RouteObject[] = [
  {
    element: <IsGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Wrap><Login /></Wrap> },
          { path: "/register", element: <Wrap><Register /></Wrap> },
        ],
      },
    ],
  },
  {
    element: <IsLoggedIn />,
    children: [
      {
        element: <BaseLayout />,
        children: [
          { path: "/dashboard", element: <Wrap><Dashboard /></Wrap> },
          { path: "/log", element: <Wrap><LogMeal /></Wrap> },
          { path: "/history", element: <Wrap><History /></Wrap> },
          { path: "/progress", element: <Wrap><Progress /></Wrap> },
          { path: "/profile", element: <Wrap><Profile /></Wrap> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];
