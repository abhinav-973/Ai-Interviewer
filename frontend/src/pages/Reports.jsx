import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  Loader2,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import interviewService from "../services/interviewService";

const getScoreColor = (score) => {
  if (score >= 80) {
    return "text-emerald-400";
  }

  if (score >= 60) {
    return "text-blue-400";
  }

  if (score >= 35) {
    return "text-amber-300";
  }

  return "text-red-300";
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await interviewService.getInterviewReports();
        setReports(response.data?.data?.reports || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load interview reports",
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const averageScore = useMemo(() => {
    if (!reports.length) {
      return 0;
    }

    const total = reports.reduce((sum, report) => sum + (report.score || 0), 0);
    return Math.round(total / reports.length);
  }, [reports]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-400" />
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
              Interview Reports
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Your performance history
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Review completed mock interviews, compare scores, and open any
              detailed AI feedback report.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <div className="flex items-center gap-2 text-slate-400">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Reports</span>
              </div>
              <p className="mt-2 text-3xl font-bold">{reports.length}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <div className="flex items-center gap-2 text-slate-400">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Average</span>
              </div>
              <p
                className={`mt-2 text-3xl font-bold ${getScoreColor(averageScore)}`}
              >
                {averageScore}%
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        )}

        {!error && !reports.length && (
          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
            <Trophy className="mx-auto h-12 w-12 text-blue-400" />
            <h2 className="mt-4 text-2xl font-bold">No reports yet</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Complete an interview to generate your first AI evaluation report.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {reports.map((report) => (
            <button
              key={report._id}
              type="button"
              onClick={() => navigate(`/interviews/${report._id}/results`)}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500/70 hover:bg-slate-900/80"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-400">
                    {report.status}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{report.role}</h2>
                </div>

                <div
                  className={`text-4xl font-bold ${getScoreColor(report.score || 0)}`}
                >
                  {report.score || 0}%
                </div>
              </div>

              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
                {report.feedback || "No feedback summary available."}
              </p>
              {report.strengths?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-emerald-400">
                    Strengths
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {report.strengths.slice(0, 3).map((strength, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.weaknesses?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-red-400">
                    Areas to Improve
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {report.weaknesses.slice(0, 3).map((weakness, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300"
                      >
                        {weakness}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {(report.techStack || []).slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {formatDate(report.updatedAt || report.createdAt)}
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  {report.duration || 0} min
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  {report.questionCount || 0} questions
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
