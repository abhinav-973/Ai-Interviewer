import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  PlayCircle,
} from "lucide-react";

const ReturningUserSection = ({
  canStartInterview,
  errorMessage,
  isCreating,
  onStartInterview,
  onViewReports,
  skills = [],
  title = "Continue Your AI Interview Journey",
  description = "Upload an updated resume or start a new interview session to improve your performance even further.",
}) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-8">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-slate-400">
        {description}
      </p>

      <div className="mt-5 flex max-w-2xl items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm">
        {canStartInterview ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        )}

        <span className={canStartInterview ? "text-emerald-200" : "text-amber-100"}>
          {canStartInterview
            ? `${skills.length} skills found. You can start the interview now.`
            : "Upload your resume and wait for skill extraction before starting."}
        </span>
      </div>

      {errorMessage && (
        <div className="mt-4 max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={onStartInterview}
          disabled={!canStartInterview || isCreating}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isCreating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
          {isCreating ? "Starting..." : "Start Interview"}
        </button>

        <button
          type="button"
          onClick={onViewReports}
          className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold transition hover:border-blue-500"
        >
          <FileText className="mr-2 inline h-5 w-5" />
          View Reports
        </button>
      </div>
    </div>
  );
};

export default ReturningUserSection;
