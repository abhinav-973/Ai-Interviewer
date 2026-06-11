import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import ResumeUploadCard from "../components/dashboard/ResumeUploadCard";
import DashboardHero from "../components/dashboard/DashboardHero";
import StatsCards from "../components/dashboard/StatsCards";
import ReturningUserSection from "../components/dashboard/ReturningUserSection";
import { createInterviewAsync } from "../features/interview/interviewSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(
    (state) => state.auth.user
  );
  const {
    creating,
    error,
  } = useSelector((state) => state.interview);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  const hasPreviousInterviews =
    user.interviewsTaken > 0;
  const skills = Array.isArray(user.skills) ? user.skills : [];
  const canStartInterview = Boolean(user.resumeUrl && skills.length);
  const interviewError = error?.message || "";

  const handleStartInterview = async () => {
    if (!canStartInterview) {
      return;
    }

    const result = await dispatch(
      createInterviewAsync({
        role: user.targetRole,
        techStack: skills,
      }),
    );

    if (createInterviewAsync.fulfilled.match(result)) {
      navigate(`/interviews/${result.payload._id}`);
    }
  };

  const handleViewReports = () => {
    navigate("/reports");
  };

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
            <div className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <ResumeUploadCard />
                <DashboardHero />
              </div>

              <ReturningUserSection
                canStartInterview={canStartInterview}
                description="Upload your resume first. Once the skills are extracted, start a mock technical interview based on your profile."
                errorMessage={interviewError}
                isCreating={creating}
                onStartInterview={handleStartInterview}
                onViewReports={handleViewReports}
                skills={skills}
                title="Start Your First Interview"
              />
            </div>
          ) : (
            <div className="space-y-8">
              <StatsCards user={user} />

              <ReturningUserSection
                canStartInterview={canStartInterview}
                errorMessage={interviewError}
                isCreating={creating}
                onStartInterview={handleStartInterview}
                onViewReports={handleViewReports}
                skills={skills}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
