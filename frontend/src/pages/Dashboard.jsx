import { useSelector } from "react-redux";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import ResumeUploadCard from "../components/dashboard/ResumeUploadCard";
import DashboardHero from "../components/dashboard/DashboardHero";
import StatsCards from "../components/dashboard/StatsCards";
import ReturningUserSection from "../components/dashboard/ReturningUserSection";

const Dashboard = () => {
  const user = useSelector(
    (state) => state.auth.user
  );

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  const hasPreviousInterviews =
    user.interviewsTaken > 0;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* background glow */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative z-10">
        <DashboardHeader
          user={user}
          hasPreviousInterviews={
            hasPreviousInterviews
          }
        />

        <div className="mx-auto mt-10 max-w-7xl px-6 pb-10">
          {!hasPreviousInterviews ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <ResumeUploadCard />
              <DashboardHero />
            </div>
          ) : (
            <div className="space-y-8">
              <StatsCards user={user} />

              <ReturningUserSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;