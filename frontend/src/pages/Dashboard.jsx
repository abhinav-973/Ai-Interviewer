import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { logoutAsync } from "../features/auth/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogout = async () => {
    const result = await dispatch(logoutAsync());
    if (logoutAsync.fulfilled.match(result)) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-blue-400">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold">Welcome to the Dashboard!</h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 font-medium text-slate-100 transition hover:border-red-500/70 hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
