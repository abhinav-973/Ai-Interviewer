import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/user.controller.js";
import { uploadResume } from "../controllers/upload.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer"

const userRouter = Router();
const mult = multer();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(mult.none(),loginUser);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/verify-reset-otp").post(verifyResetOtp);
userRouter.route("/reset-password/:resetToken").post(resetPassword);

//protected routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/change-password").patch(verifyJWT, changePassword);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/upload-resume").post(verifyJWT, upload.single("resume"), uploadResume);

export default userRouter;
