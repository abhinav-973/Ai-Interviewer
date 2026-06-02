import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Interview from "../models/interview.model.js";
import {
  evaluateAnswer,
  generateQuestions,
} from "../utils/generateQuestions.js";

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

const createAnswerLookup = (answers = []) => {
  const answerByQuestionId = new Map();
  const answerByIndex = new Map();

  answers.forEach((answerItem, index) => {
    if (typeof answerItem === "string") {
      answerByIndex.set(index, answerItem);
      return;
    }

    if (!answerItem || typeof answerItem !== "object") {
      return;
    }

    if (answerItem.questionId) {
      answerByQuestionId.set(String(answerItem.questionId), answerItem.answer);
    }

    answerByIndex.set(index, answerItem.answer);
  });

  return { answerByQuestionId, answerByIndex };
};

const buildInterviewFeedback = (overallScore) => {
  if (overallScore >= 80) {
    return "Strong interview performance. Your answers were detailed and showed practical understanding.";
  }

  if (overallScore >= 60) {
    return "Solid interview attempt. Add more examples, tradeoffs, and implementation depth to improve.";
  }

  if (overallScore >= 35) {
    return "The interview needs more complete answers. Focus on explaining reasoning and real project experience.";
  }

  return "The interview submission was too brief. Provide complete answers before submitting.";
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

  const questions = generateQuestions(techStack);

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

  const { answerByQuestionId, answerByIndex } = createAnswerLookup(answers);
  let totalScore = 0;

  interview.questions = interview.questions.map((question, index) => {
    const questionId = question._id?.toString();
    const submittedAnswer =
      questionId && answerByQuestionId.has(questionId)
        ? answerByQuestionId.get(questionId)
        : answerByIndex.get(index);
    const answer = String(submittedAnswer || "");
    const evaluation = evaluateAnswer(answer);

    totalScore += evaluation.score;

    question.answer = answer;
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;

    return question;
  });

  const overallScore = interview.questions.length
    ? Math.round(totalScore / interview.questions.length)
    : 0;

  interview.score = overallScore;
  interview.averageScore = overallScore;
  interview.feedback = buildInterviewFeedback(overallScore);
  interview.strengths = interview.questions
    .filter((question) => question.score >= 75)
    .slice(0, 3)
    .map((question) => `Strong answer for: ${question.question}`);
  interview.weaknesses = interview.questions
    .filter((question) => question.score < 60)
    .slice(0, 3)
    .map((question) => `Needs improvement: ${question.question}`);
  interview.duration = Number(duration) || 0;
  interview.status = "Completed";

  await interview.save();

  const user = await updateUserAnalytics(req.user, overallScore);

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
