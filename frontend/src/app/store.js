import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import interviewReducer from "../features/interview/interviewSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer,
  },
});
