import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Interview from "../models/interview.model.js";
import { generateQuestions } from "../utils/generateQuestions.js";
import { aiInterviewAnalyser } from "../utils/aiInterviewAnalyser.js";

const normalizeTechStack = (techStack = []) =>
  techStack
    .map((skill) => String(skill || "").trim())
    .filter(Boolean);

const findUserInterview = async (interviewId, userId) => {
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  if (interview.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to access this interview");
  }

  return interview;
};

const updateUserAnalytics = async (user, overallScore) => {
  const previousInterviewsTaken = user.interviewsTaken || 0;
  const previousAverageScore = user.averageScore || 0;

  user.interviewsTaken = previousInterviewsTaken + 1;
  user.averageScore = Math.round(
    (previousAverageScore * previousInterviewsTaken + overallScore) /
      user.interviewsTaken,
  );

  await user.save({ validateBeforeSave: false });

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    resumeUrl: user.resumeUrl,
    resumeText: user.resumeText,
    skills: user.skills,
    targetRole: user.targetRole,
    experienceLevel: user.experienceLevel,
    interviewsTaken: user.interviewsTaken,
    averageScore: user.averageScore,
  };
};

const getSubmittedAnswer = (answers, question, index) => {
  const questionId = String(question._id);
  const answerByQuestionId = answers.find(
    (answerItem) =>
      answerItem &&
      typeof answerItem === "object" &&
      String(answerItem.questionId || "") === questionId,
  );

  if (answerByQuestionId) {
    return answerByQuestionId.answer;
  }

  const submittedAnswer = answers[index];

  if (typeof submittedAnswer === "string") {
    return submittedAnswer;
  }

  if (!submittedAnswer || typeof submittedAnswer !== "object") {
    return "";
  }

  if (submittedAnswer.questionId) {
    return "";
  }

  return submittedAnswer.answer;
};

export const createInterview = asyncHandler(async (req, res) => {
  const requestedTechStack = Array.isArray(req.body.techStack)
    ? req.body.techStack
    : [];
  const userTechStack = Array.isArray(req.user.skills) ? req.user.skills : [];
  const techStack = normalizeTechStack(
    requestedTechStack.length ? requestedTechStack : userTechStack,
  );
  const role = String(
    req.body.role || req.user.targetRole || "Software Developer",
  ).trim();

  if (!techStack.length) {
    throw new ApiError(400, "Tech stack is required");
  }

  let questions;

  try {
    questions = await generateQuestions(techStack, req.user.resumeText);
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  if (!questions.length) {
    throw new ApiError(500, "Could not generate interview questions");
  }

  const interview = await Interview.create({
    user: req.user._id,
    role,
    techStack,
    questions,
    status: "Pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, interview, "Interview created successfully"));
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const interview = await findUserInterview(interviewId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview fetched successfully"));
});

export const getInterviewReports = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({
    user: req.user._id,
    status: "Completed",
  })
    .sort({ updatedAt: -1 })
    .lean();

  const reports = interviews.map((interview) => ({
    _id: interview._id,
    role: interview.role,
    techStack: interview.techStack || [],
    score: interview.score || 0,
    averageScore: interview.averageScore || 0,
    feedback: interview.feedback || "",
    strengths: interview.strengths || [],
    weaknesses: interview.weaknesses || [],
    duration: interview.duration || 0,
    status: interview.status,
    questionCount: interview.questions?.length || 0,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reports,
        total: reports.length,
      },
      "Interview reports fetched successfully",
    ),
  );
});

export const submitInterview = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const { answers, duration = 0 } = req.body;

  if (!Array.isArray(answers)) {
    throw new ApiError(400, "Answers must be an array");
  }

  const interview = await findUserInterview(interviewId, req.user._id);

  if (interview.status === "Completed") {
    throw new ApiError(400, "Interview has already been submitted");
  }

  interview.questions = interview.questions.map((question, index) => {
    question.answer = String(getSubmittedAnswer(answers, question, index) || "");
    question.score = 0;
    question.feedback = "";

    return question;
  });

  let analysis;

  try {
    analysis = await aiInterviewAnalyser(interview.questions);
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  interview.questions = interview.questions.map((question, index) => {
    const evaluation = analysis.evaluations[index] || {};

    question.score = evaluation.score || 0;
    question.feedback = evaluation.feedback || "";

    return question;
  });

  interview.score = analysis.overallScore;
  interview.averageScore = analysis.overallScore;
  interview.feedback = analysis.feedback;
  interview.strengths = analysis.strengths;
  interview.weaknesses = analysis.weaknesses;
  interview.duration = Number(duration) || 0;
  interview.status = "Completed";

  await interview.save();

  const user = await updateUserAnalytics(req.user, analysis.overallScore);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        interview,
        user,
      },
      "Interview submitted successfully",
    ),
  );
});
