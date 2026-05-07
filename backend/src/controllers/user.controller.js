import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, email, password } = req.body;

  // validation
  if (
    [fullName, email, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required and cannot be empty");
  }

  // check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // create user
  const user = await User.create({
    fullName,
    email,
    password,
  });

  // remove sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // check if user created successfully
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // send response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
