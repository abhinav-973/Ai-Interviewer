import apiClient from "./apiClient";

export const interviewService = {
  createInterview: (payload = {}) =>
    apiClient.post("/api/v1/users/interviews", payload),

  getInterviewById: (interviewId) =>
    apiClient.get(`/api/v1/users/interviews/${interviewId}`),

  submitInterview: (interviewId, payload) =>
    apiClient.post(`/api/v1/users/interviews/${interviewId}/submit`, payload),
};

export default interviewService;
