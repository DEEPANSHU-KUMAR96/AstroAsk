import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/state/auth.slice";
import horoscopeReducer from "../../features/horoscope/state/horoscope.slice";
import kundliReducer from "../../features/kundli/state/kundli.slice";
import chatReducer from "../../features/chat/state/chatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    horoscope: horoscopeReducer,
    kundli: kundliReducer,
    chat: chatReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;