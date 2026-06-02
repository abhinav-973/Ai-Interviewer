import { LogOut, Upload } from "lucide-react";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logoutAsync } from "../../features/auth/authSlice";

const DashboardHeader = ({
  user,
  hasPreviousInterviews,
}) => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleLogout = async () => {
    const result =
      await dispatch(logoutAsync());

    if (logoutAsync.fulfilled.match(result)) {
      navigate("/login", {
        replace: true,
      });
    }
  };
  
  console.log("DashboardHeader rendered with user:", user);
  console.log("hasPreviousInterviews:", hasPreviousInterviews);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
            AI Interview Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Welcome back,
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {" "}
              {user.fullName}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {hasPreviousInterviews && (
            <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-400">
              <Upload className="h-5 w-5" />
              Upload Resume
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium transition hover:border-red-500/70 hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;