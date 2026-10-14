/** @format */

import express from "express";
import rateLimit from "express-rate-limit";
import {
  changePassword,
  confirmOtp,
  createUser,
  getProfile,
  login,
  loginWithGoogle,
  requestPasswordReset,
  resetPassword,
} from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authentication.js";

const router = express.Router();

const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many reset code requests. Please try again later." },
});

const passwordResetAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many reset attempts. Please try again later." },
});

router.post("/register", createUser);
router.post("/confirm-otp", confirmOtp);
router.post("/login", login);
router.post("/google", loginWithGoogle);
router.get("/profile", authenticateUser, getProfile);
router.patch("/password", authenticateUser, changePassword);
router.post("/forgot-password", passwordResetRequestLimiter, requestPasswordReset);
router.post("/reset-password", passwordResetAttemptLimiter, resetPassword);

export default router;