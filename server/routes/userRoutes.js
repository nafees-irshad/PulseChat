/** @format */

import express from "express";
const router = express.Router();

//improt controller
import {
  createUser,
  confirmOtp,
  login,
  loginWithGoogle,
  getProfile,
} from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authentication.js";

router.post("/register", createUser);
router.post("/confirm-otp", confirmOtp);
router.post("/login", login);
router.post("/google", loginWithGoogle);
router.get("/profile", authenticateUser, getProfile);

export default router;
