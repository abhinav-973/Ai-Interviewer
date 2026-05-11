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
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/verify-reset-otp").post(verifyResetOtp);
userRouter.route("/reset-password/:resetToken").post(resetPassword);

//protected routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/change-password").patch(verifyJWT, changePassword);
userRouter.route("/refresh-token").post(refreshAccessToken);

export default userRouter;
