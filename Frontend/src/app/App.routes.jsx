import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import BirthDetails from "../features/auth/pages/BirthDetails";
import Login from "../features/auth/pages/Login";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import Subscription from "../features/auth/pages/Subscription";

/**
 * App Routes configured using createBrowserRouter
 * Registration flow: /register → /verify-email → /birth-details → /subscription
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/register" replace />,
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
    element: <Navigate to="/register" replace />,
  },
]);

export { router };
export default router;

