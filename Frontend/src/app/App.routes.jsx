import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import BirthDetails from "../features/auth/pages/BirthDetails";
import Login from "../features/auth/pages/Login";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import Subscription from "../features/auth/pages/Subscription";

/**
 * App Routes
 * Registration flow: /register → /verify-email → /birth-details → /subscription
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/register" replace />} />

      {/* Auth flow */}
      <Route path="/register"     element={<Register />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/verify-email"   element={<VerifyEmail />} />
      <Route path="/birth-details" element={<BirthDetails />} />
      <Route path="/subscription" element={<Subscription />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
};

export default AppRoutes;
