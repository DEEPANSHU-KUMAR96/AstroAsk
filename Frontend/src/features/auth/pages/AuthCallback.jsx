import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "../state/auth.slice";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google sign-in failed. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      localStorage.setItem("accessToken", token);
      dispatch(getMe())
        .unwrap()
        .then((user) => {
          toast.success(`Welcome, ${user.name || "Traveller"}! ✨`);
          navigate("/horoscope", { replace: true });
        })
        .catch(() => {
          toast.error("Failed to load user profile");
          navigate("/login", { replace: true });
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf9f8] text-[#1a1a1a] p-4">
      <div className="w-12 h-12 rounded-full border-3 border-[#ffb800] border-t-transparent animate-spin mb-4" />
      <h2 className="font-['Playfair_Display',Georgia,serif] text-xl font-bold text-[#7c5800]">
        Harmonizing Cosmic Alignments...
      </h2>
      <p className="text-sm text-[#5f5e5e] mt-1 font-['Inter',sans-serif]">
        Securing your celestial session
      </p>
    </div>
  );
};

export default AuthCallback;
