import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import interviewService from "../../services/interviewService";
import { updateUserProfile } from "../auth/authSlice";

const getErrorPayload = (error, fallbackMessage) =>
  error.response?.data || {
    message: error.message || fallbackMessage,
  };

const initialState = {
  currentInterview: null,
  loading: false,
  creating: false,
  submitting: false,
  error: null,
};

export const createInterviewAsync = createAsyncThunk(
  "interview/createInterview",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await interviewService.createInterview(payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Could not create interview"));
    }
  },
);

export const fetchInterviewByIdAsync = createAsyncThunk(
  "interview/fetchInterviewById",
  async (interviewId, { rejectWithValue }) => {
    try {
      const response = await interviewService.getInterviewById(interviewId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Could not fetch interview"));
    }
  },
);

export const submitInterviewAsync = createAsyncThunk(
  "interview/submitInterview",
  async ({ interviewId, answers, duration }, { dispatch, rejectWithValue }) => {
    try {
      const response = await interviewService.submitInterview(interviewId, {
        answers,
        duration,
      });
      const data = response.data.data;

      if (data.user) {
        dispatch(updateUserProfile(data.user));
      }

      return data.interview;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Could not submit interview"));
    }
  },
);

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    clearInterviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInterviewAsync.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createInterviewAsync.fulfilled, (state, action) => {
        state.creating = false;
        state.currentInterview = action.payload;
      })
      .addCase(createInterviewAsync.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(fetchInterviewByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInterview = action.payload;
      })
      .addCase(fetchInterviewByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitInterviewAsync.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitInterviewAsync.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentInterview = action.payload;
      })
      .addCase(submitInterviewAsync.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearInterviewError } = interviewSlice.actions;

export default interviewSlice.reducer;
