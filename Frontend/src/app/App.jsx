import React from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./App.routes";

const App = () => {
  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            background: "#1a1a1a",
            color: "#fbf9f8",
            borderRadius: "6px",
            padding: "12px 18px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
          success: {
            iconTheme: { primary: "#ffb800", secondary: "#1a1a1a" },
          },
          error: {
            iconTheme: { primary: "#ba1a1a", secondary: "#fff" },
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
};

export default App;