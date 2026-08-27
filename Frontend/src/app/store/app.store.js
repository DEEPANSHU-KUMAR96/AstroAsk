import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/state/auth.slice";
import horoscopeReducer from "../../features/horoscope/state/horoscope.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    horoscope: horoscopeReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;