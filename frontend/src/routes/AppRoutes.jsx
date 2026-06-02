import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
// auth pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Preview from "../pages/Preview";
import Dashboard from "../pages/Dashboard";
import ForgotPassword from "../pages/ForgotPassword";
import InterviewPage from "../pages/InterviewPage";
import InterviewResults from "../pages/InterviewResults";
const AppRoutes = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Preview />
        }
      />

      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        }
      />

      <Route
        path="/register"
        element={
          !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
        }
      />

      <Route
        path="/forgot-password"
        element={
          !isAuthenticated ? (
            <ForgotPassword />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route
        path="/reset-password/:resetToken"
        element={
          !isAuthenticated ? (
            <ForgotPassword />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/interviews/:interviewId"
        element={
          isAuthenticated ? <InterviewPage /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/interviews/:interviewId/results"
        element={
          isAuthenticated ? (
            <InterviewResults />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
