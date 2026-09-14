import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import BirthDetails from "../features/auth/pages/BirthDetails";
import Login from "../features/auth/pages/Login";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import Subscription from "../features/auth/pages/Subscription";
import AuthCallback from "../features/auth/pages/AuthCallback";
import Horoscope from "../features/horoscope/pages/Horoscope";
import KundliPage from "../features/kundli/pages/Kundli";
import ChatPage from "../features/chat/pages/Chat";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/horoscope" replace />,
  },
  {
    path: "/horoscope",
    element: <Horoscope />,
  },
  {
    path: "/kundli",
    element: <KundliPage />,
  },
  {
    path: "/kundli/:id",
    element: <KundliPage />,
  },
  {
    path: "/chat",
    element: <ChatPage />,
  },
  {
    path: "/chat/:id",
    element: <ChatPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/birth-details",
    element: <BirthDetails />,
  },
  {
    path: "/subscription",
    element: <Subscription />,
  },
  {
    path: "/dashboard",
    element: <Navigate to="/horoscope" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/horoscope" replace />,
  },
]);

export { router };
export default router;
