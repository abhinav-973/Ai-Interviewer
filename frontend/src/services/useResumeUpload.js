// hooks/useResumeUpload.js

import { useState } from "react";
import { useDispatch } from "react-redux";

import apiClient from "../services/apiClient";
import { updateUserProfile } from "../features/auth/authSlice";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".docx"];

const getUploadErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Could not upload resume. Please try again.";

export const useResumeUpload = () => {
  const dispatch = useDispatch();

  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateResume = (file) => {
    const fileName = file.name.toLowerCase();

    const hasAllowedExtension =
      ALLOWED_RESUME_EXTENSIONS.some((extension) =>
        fileName.endsWith(extension)
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
    const validationError = validateResume(file);

    if (validationError) {
      setErrorMessage(validationError);
      return false;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await apiClient.post(
        "/api/v1/users/upload-resume",
        formData
      );

      setSuccessMessage(
        response.data?.message ||
          "Resume uploaded and analyzed successfully."
      );

      if (response.data?.data?.user) {
        dispatch(updateUserProfile(response.data.data.user));
      }

      return true;
    } catch (error) {
      setErrorMessage(getUploadErrorMessage(error));
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadResume,
    isUploading,
    successMessage,
    errorMessage,
    clearMessages: () => {
      setSuccessMessage("");
      setErrorMessage("");
    },
  };
};