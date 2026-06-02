import React, { useEffect, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Trophy,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { fetchInterviewByIdAsync } from "../features/interview/interviewSlice";

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

const InterviewResults = () => {
  const { interviewId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    currentInterview,
    error,
    loading,
  } = useSelector((state) => state.interview);

  const questions = useMemo(
    () => currentInterview?.questions || [],
    [currentInterview],
  );
  const overallScore = currentInterview?.score || 0;

  useEffect(() => {
    dispatch(fetchInterviewByIdAsync(interviewId));
  }, [dispatch, interviewId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-400" />
        Loading results...
      </div>
    );
  }

  if (!currentInterview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Results not found</h1>
          <p className="mt-3 text-slate-400">
            {error?.message || "We could not load this interview result."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (currentInterview.status !== "Completed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-blue-400" />
          <h1 className="mt-4 text-2xl font-bold">Interview still pending</h1>
          <p className="mt-3 text-slate-400">
            Submit your answers before viewing results.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/interviews/${interviewId}`)}
            className="mt-6 rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400"
          >
            Continue Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <Trophy className="h-9 w-9 text-blue-400" />
            </div>

            <p className="mt-8 text-sm font-medium uppercase tracking-wider text-blue-400">
              Interview Results
            </p>
            <h1 className="mt-2 text-3xl font-bold">{currentInterview.role}</h1>

            <div className="mt-8">
              <p className="text-sm text-slate-400">Overall Score</p>
              <div className={`mt-2 text-6xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
            </div>

            <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${overallScore}%` }}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Summary</span>
              </div>
              <p className="mt-3 leading-relaxed text-slate-300">
                {currentInterview.feedback || "No summary available."}
              </p>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                Questions answered: {questions.length}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                Duration: {currentInterview.duration || 0} min
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {questions.map((question, index) => (
              <div
                key={question._id || index}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-400">
                      Question {index + 1}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold leading-snug">
                      {question.question}
                    </h2>
                  </div>

                  <div className={`text-3xl font-bold ${getScoreColor(question.score || 0)}`}>
                    {question.score || 0}%
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-sm font-semibold text-slate-300">Answer</p>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-400">
                    {question.answer || "No answer provided."}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-sm font-semibold text-blue-200">Feedback</p>
                  <p className="mt-2 leading-relaxed text-slate-300">
                    {question.feedback || "No feedback available."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;
