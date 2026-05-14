import React, { useRef, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Plus,
} from "lucide-react";
import { useSelector } from "react-redux";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".docx"];

const getUploadErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Could not upload resume. Please try again.";

const ResumeUploadCard = () => {
  const fileInputRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const openFilePicker = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const validateResume = (file) => {
    const fileName = file.name.toLowerCase();
    const hasAllowedExtension = ALLOWED_RESUME_EXTENSIONS.some((extension) =>
      fileName.endsWith(extension),
    );

    if (!hasAllowedExtension) {
      return "Only PDF and DOCX resumes are supported.";
    }

    if (file.size > MAX_RESUME_SIZE) {
      return "Resume must be smaller than 5MB.";
    }

    return "";
  };

  const uploadResume = async (file) => {
    const activeToken =
      token ||
      (typeof window !== "undefined" ? localStorage.getItem("token") : "");

    if (!activeToken) {
      setErrorMessage("Please sign in again before uploading your resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "/api/v1/users/upload-resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
          withCredentials: true,
        },
      );

      setSuccessMessage(
        response.data?.message || "Resume uploaded and analyzed successfully.",
      );
    } catch (error) {
      setErrorMessage(getUploadErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setSuccessMessage("");
    setErrorMessage("");

    const validationMessage = validateResume(file);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      event.target.value = "";
      return;
    }

    await uploadResume(file);
    event.target.value = "";
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 transition hover:border-blue-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex min-h-[450px] flex-col items-center justify-center text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={handleResumeChange}
        />

        <button
          type="button"
          onClick={openFilePicker}
          disabled={isUploading}
          aria-label="Upload resume"
          className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-full bg-blue-500/10 transition hover:scale-105 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          {isUploading ? (
            <LoaderCircle className="h-14 w-14 animate-spin text-blue-300" />
          ) : successMessage ? (
            <CheckCircle2 className="h-14 w-14 text-emerald-400" />
          ) : (
            <Plus className="h-14 w-14 text-blue-400" />
          )}
        </button>

        <h2 className="mt-8 text-3xl font-bold">
          {isUploading ? "Analyzing Resume" : "Upload Your Resume"}
        </h2>

        <p className="mt-4 max-w-md text-slate-400">
          {isUploading
            ? "Hold tight while your resume is sent to the backend for skill analysis."
            : "Upload your resume and let our AI analyze your skills, generate interview questions, and prepare you for your dream role."}
        </p>

        {selectedFileName && (
          <div className="mt-6 flex max-w-full items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            <FileText className="h-4 w-4 shrink-0 text-blue-400" />
            <span className="truncate">{selectedFileName}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 flex max-w-md items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && !errorMessage && (
          <div className="mt-4 flex max-w-md items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <p className="mt-6 text-sm text-slate-500">
          PDF or DOCX supported, up to 5MB
        </p>
      </div>
    </div>
  );
};

export default ResumeUploadCard;
