import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Interview from "../models/interview.model.js";
import { generateQuestions } from "../utils/generateQuestions.js";
import aiInterviewAnalyser from "../utils/aiInterviewAnalyser.js";

const normalizeTechStack = (techStack = []) =>
  techStack.map((skill) => String(skill || "").trim()).filter(Boolean);

const normalizeProjects = (projects = []) =>
  projects.map((project) => ({
    name: project.name,
    description: project.description,
    technologies: project.technologies || [],
    keyFeatures: project.keyFeatures || [],
  }));

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
    skills: user.skills,
    targetRole: user.targetRole,
    experienceLevel: user.experienceLevel,
    interviewsTaken: user.interviewsTaken,
    averageScore: user.averageScore,
  };
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

  const normProjects = normalizeProjects(req.user.projects || []);

  const questions = await generateQuestions({
    role,
    skills: techStack,
    projects: normProjects,
  });

  if (!questions.length) {
    throw new ApiError(502, "Could not generate interview questions");
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

  const reports = interviews.map(({ questions = [], ...interview }) => ({
    ...interview,
    questionCount: questions.length,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reports },
        "Interview reports fetched successfully",
      ),
    );
});

export const submitInterview = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const { answers = [], duration = 0 } = req.body;

  if (!Array.isArray(answers)) {
    throw new ApiError(400, "Answers must be an array");
  }

  const interview = await findUserInterview(interviewId, req.user._id);

  if (interview.status === "Completed") {
    throw new ApiError(400, "Interview has already been submitted");
  }

  // attach answers
  interview.questions.forEach((question, index) => {
    const submittedAnswer =
      typeof answers[index] === "string"
        ? answers[index]
        : answers[index]?.answer || "";

    question.answer = submittedAnswer;
  });

  // AI evaluation
  
  const analysis = await aiInterviewAnalyser({
    questions: interview.questions,
    role: interview.role,
    skills: interview.techStack,
    projects: normalizeProjects(req.user.projects || []),
    experienceLevel: req.user.experienceLevel,
  });

  // update question scores
  interview.questions.forEach((question, index) => {
    const evaluation = analysis.evaluations?.[index];

    if (!evaluation) return;

    question.score = evaluation.score || 0;
    question.feedback = evaluation.feedback || "";
    question.strength = evaluation.strength || "";
    question.improvement = evaluation.improvement || "";
  });

  interview.score = analysis.overallScore || 0;

  interview.averageScore = analysis.overallScore || 0;

  interview.feedback = analysis.feedback || "";

  interview.strengths = analysis.strengths || [];

  interview.weaknesses = analysis.weaknesses || [];

  interview.duration = Number(duration) || 0;

  interview.status = "Completed";

  await interview.save();

  const user = await updateUserAnalytics(req.user, interview.score);

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
