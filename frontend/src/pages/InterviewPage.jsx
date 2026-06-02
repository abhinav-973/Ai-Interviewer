import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Send,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchInterviewByIdAsync,
  submitInterviewAsync,
} from "../features/interview/interviewSlice";

const getQuestionKey = (question, index) => question._id || String(index);

const InterviewPage = () => {
  const { interviewId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const startedAtRef = useRef(Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const {
    currentInterview,
    error,
    loading,
    submitting,
  } = useSelector((state) => state.interview);

  const questions = useMemo(
    () => currentInterview?.questions || [],
    [currentInterview],
  );
  const currentQuestion = questions[currentIndex];
  const currentQuestionKey = currentQuestion
    ? getQuestionKey(currentQuestion, currentIndex)
    : "";
  const isFinalQuestion = currentIndex === questions.length - 1;
  const answeredCount = questions.filter((question, index) => {
    const key = getQuestionKey(question, index);
    return answers[key]?.trim();
  }).length;

  useEffect(() => {
    dispatch(fetchInterviewByIdAsync(interviewId));
  }, [dispatch, interviewId]);

  useEffect(() => {
    if (!currentInterview?._id) {
      return;
    }

    const initialAnswers = {};

    currentInterview.questions?.forEach((question, index) => {
      initialAnswers[getQuestionKey(question, index)] = question.answer || "";
    });

    setAnswers(initialAnswers);
    setCurrentIndex(0);
  }, [currentInterview?._id]);

  const handleAnswerChange = (event) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestionKey]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    const payload = questions.map((question, index) => {
      const key = getQuestionKey(question, index);

      return {
        questionId: question._id,
        answer: answers[key] || "",
      };
    });
    const duration = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 60000),
    );

    const result = await dispatch(
      submitInterviewAsync({
        interviewId,
        answers: payload,
        duration,
      }),
    );

    if (submitInterviewAsync.fulfilled.match(result)) {
      navigate(`/interviews/${interviewId}/results`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-400" />
        Loading interview...
      </div>
    );
  }

  if (!currentInterview || !questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Interview not available</h1>
          <p className="mt-3 text-slate-400">
            We could not find any questions for this interview.
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

  if (currentInterview.status === "Completed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h1 className="mt-4 text-2xl font-bold">Interview submitted</h1>
          <p className="mt-3 text-slate-400">
            Your results are ready to review.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/interviews/${interviewId}/results`)}
            className="mt-6 rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Dashboard
        </button>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
                {currentInterview.role}
              </p>
              <h1 className="mt-2 text-3xl font-bold">
                Mock Technical Interview
              </h1>
              <p className="mt-3 text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              {answeredCount}/{questions.length} answered
            </div>
          </div>

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold leading-snug">
              {currentQuestion.question}
            </h2>

            <textarea
              value={answers[currentQuestionKey] || ""}
              onChange={handleAnswerChange}
              rows={10}
              placeholder="Write your answer here..."
              className="mt-6 min-h-64 w-full resize-none rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 leading-relaxed text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {error?.message && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error.message}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex === 0 || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
              Previous
            </button>

            {isFinalQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {submitting ? "Submitting..." : "Submit Interview"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(questions.length - 1, index + 1),
                  )
                }
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Next
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
