import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  //req.body->data
  //username or email
  //find the user in the database
  //compare the password
  //access token and refresh token
  //send cookie

  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const validPassword = await user.isPasswordCorrect(password);

  if (!validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedinUser = user.toObject();
  delete loggedinUser.password;
  delete loggedinUser.refreshToken;

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedinUser, accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    },
    
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
