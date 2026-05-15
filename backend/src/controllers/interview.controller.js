import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Interview from "../models/interview.model.js";

export const createInterview = asyncHandler(async (req, res) => {
  const {
    role,
    techStack,
    questions,
    feedback,
    strengths,
    weaknesses,
    duration,
  } = req.body;

  // Validation
  if (!role?.trim()) {
    throw new ApiError(400, "Role is required");
  }

  if (!Array.isArray(techStack) || techStack.length === 0) {
    throw new ApiError(400, "Tech stack is required");
  }

  // Logged in user from middleware
  const user = req.user;

  // Create interview
  const interview = await Interview.create({
    user: user._id,
    role,
    techStack,
    status: "Pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, interview, "Interview created successfully"));
});
