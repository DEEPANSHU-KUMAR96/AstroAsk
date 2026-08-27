import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import BirthDetails from "../features/auth/pages/BirthDetails";
import Login from "../features/auth/pages/Login";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import Subscription from "../features/auth/pages/Subscription";
import Horoscope from "../features/horoscope/pages/Horoscope";

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
    path: "*",
    element: <Navigate to="/horoscope" replace />,
  },
]);

export { router };
export default router;

