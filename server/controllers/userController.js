import db from "../models/index.js";
const { User } = db;
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { randomBytes, randomInt } from "node:crypto";
import dotenv from "dotenv";
import {
  generateOtpEmailHtml,
  generatePasswordResetOtpEmailHtml,
} from "../utils/mailTemplete.js";
dotenv.config();

export const generateOtp = () => String(randomInt(100000, 1000000));

async function sendPasswordResetOtp(email, otp) {
  const smtpUser = process.env.SMTP_USER || "nafees.ahmed2189@gmail.com";
  const smtpPassword = process.env.SMTP_PASS;
  if (!smtpPassword) {
    throw new Error(
      "SMTP_PASS must be configured to send password reset emails.",
    );
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  await transporter.sendMail({
    from: `"PulseChat" <${smtpUser}>`,
    to: email,
    subject: "Your PulseChat password reset code",
    text: `Your PulseChat password reset code is ${otp}. It expires in 10 minutes.`,
    html: generatePasswordResetOtpEmailHtml(otp),
  });
}

function passwordValidationError(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password must be no more than 72 UTF-8 bytes.";
  }
  return null;
}

async function sendVerificationOtp(email, otp) {
  const smtpUser = process.env.SMTP_USER || "nafees.ahmed2189@gmail.com";
  const smtpPassword = process.env.SMTP_PASS;
  if (!smtpPassword) {
    throw new Error(
      "SMTP_PASS must be configured to send verification emails.",
    );
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  await transporter.sendMail({
    from: `"PulseChat" <${smtpUser}>`,
    to: email,
    subject: "Your PulseChat verification code",
    text: `Your PulseChat verification code is ${otp}. It expires in 10 minutes.`,
    html: generateOtpEmailHtml(otp),
  });
}

function queueVerificationOtp(email, otp, userId, otpHash) {
  setImmediate(async () => {
    try {
      await sendVerificationOtp(email, otp);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      try {
        const user = await User.findByPk(userId);
        if (user?.otpHash === otpHash) {
          await user.update({ otpHash: null, otpExpiresAt: null });
        }
      } catch (cleanupError) {
        console.error("Failed to clear undelivered verification code:", cleanupError);
      }
    }
  });
}

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "all fields are required" });
    }
    const passwordError = passwordValidationError(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    if (!process.env.SMTP_PASS) {
      return res.status(503).json({
        status: "failed",
        message: "Email delivery is not configured. Please try again later.",
      });
    }

    let user = await User.findOne({ where: { email } });
    if (user?.isVerified) {
      return res.status(400).json({ msg: "user already exist" });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      await user.update({ otpHash, otpExpiresAt });
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email,
        password: hashPassword,
        otpHash,
        otpExpiresAt,
      });
    }

    queueVerificationOtp(email, otp, user.id, otpHash);

    return res.status(201).json({
      status: "success",
      message: "Your account is ready. Your verification code is on its way.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error creating user or sending verification email:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create the account or send a verification email.",
    });
  }
};

export const confirmOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (
    typeof email !== "string" ||
    typeof otp !== "string" ||
    !/^\d{6}$/.test(otp)
  ) {
    return res
      .status(400)
      .json({ message: "A valid email and 6-digit code are required." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account was found for that email." });
    }
    if (user.isVerified) {
      return res.status(200).json({
        status: "success",
        message: "Email is already verified.",
        user: { email: user.email, isVerified: true },
      });
    }
    if (
      !user.otpHash ||
      !user.otpExpiresAt ||
      new Date(user.otpExpiresAt).getTime() <= Date.now()
    ) {
      return res
        .status(400)
        .json({
          message:
            "The verification code has expired. Please sign up again to get a new code.",
        });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpValid) {
      return res
        .status(400)
        .json({ message: "The verification code is incorrect." });
    }

    await user.update({
      isVerified: true,
      otpHash: null,
      otpExpiresAt: null,
    });

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully.",
      user: { email: user.email, isVerified: user.isVerified },
    });
  } catch (error) {
    console.error("Error confirming verification code:", error);
    return res.status(500).json({ message: "Unable to verify your email." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  try {
    //check if user email exist
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Email not found",
      });
    }
    if (!email || !password) {
      return res.status(400).json({ msg: "all fields are required" });
    }
    //validating password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid credentials",
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        status: "failed",
        message: "Please verify your email before logging in.",
      });
    }
    //generate token
    const token = JWT.sign(
      {
        id: user.id, // Include the user's ID
        iat: Date.now(), // This is optional, jwt.sign adds iat automatically
      },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }, // or whatever expiration you want
    );
    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Login error");
  }
};

export const loginWithGoogle = async (req, res) => {
  const accessToken = req.body?.accessToken;
  if (typeof accessToken !== "string" || !accessToken) {
    return res
      .status(400)
      .json({ message: "A Google access token is required." });
  }

  let googleProfile;
  try {
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (!response.ok) {
      return res
        .status(401)
        .json({ message: "Google sign-in could not be verified." });
    }
    googleProfile = await response.json();
  } catch (error) {
    console.error("Google userinfo request failed:", error);
    return res
      .status(502)
      .json({ message: "Google sign-in is temporarily unavailable." });
  }

  if (
    !googleProfile ||
    typeof googleProfile.email !== "string" ||
    googleProfile.email_verified !== true
  ) {
    return res
      .status(401)
      .json({ message: "A verified Google email is required." });
  }

  try {
    let user = await User.findOne({ where: { email: googleProfile.email } });
    if (!user) {
      const password = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
      user = await User.create({
        name: googleProfile.name || googleProfile.email.split("@")[0],
        email: googleProfile.email,
        password,
        isVerified: true,
      });
    } else if (!user.isVerified) {
      await user.update({ isVerified: true });
    }

    const token = JWT.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Google login failed:", error);
    return res
      .status(500)
      .json({ message: "Unable to complete Google sign-in." });
  }
};


export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({ message: "Current password is required." });
  }
  const passwordError = passwordValidationError(newPassword);
  if (passwordError) return res.status(400).json({ message: passwordError });

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    await user.update({
      password: await bcrypt.hash(newPassword, 10),
      otpHash: null,
      otpExpiresAt: null,
    });
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({ message: "Unable to update your password." });
  }
}

export async function requestPasswordReset(req, res) {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (!process.env.SMTP_PASS) {
    return res.status(503).json({
      message: "Email delivery is unavailable. Please try again later.",
    });
  }

  try {
    const user = await User.findOne({ where: { email, isVerified: true } });
    const message =
      "If a verified account exists for that email, a reset code has been sent.";
    if (!user) return res.status(200).json({ message });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    await user.update({
      otpHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendPasswordResetOtp(user.email, otp);
    } catch (error) {
      await User.update(
        { otpHash: null, otpExpiresAt: null },
        { where: { id: user.id, otpHash } },
      );
      throw error;
    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("requestPasswordReset error:", error);
    return res.status(500).json({
      message: "Unable to send a reset code. Please try again later.",
    });
  }
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body ?? {};
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof otp !== "string" ||
    !/^\d{6}$/.test(otp)
  ) {
    return res.status(400).json({
      message: "A valid email and 6-digit reset code are required.",
    });
  }
  const passwordError = passwordValidationError(newPassword);
  if (passwordError) return res.status(400).json({ message: passwordError });

  try {
    const user = await User.findOne({
      where: { email: email.trim(), isVerified: true },
    });
    const isOtpActive =
      user?.otpHash &&
      user.otpExpiresAt &&
      new Date(user.otpExpiresAt).getTime() > Date.now();
    const isOtpValid = isOtpActive && (await bcrypt.compare(otp, user.otpHash));

    if (!isOtpValid) {
      return res.status(400).json({ message: "The reset code is invalid or has expired. Request a new code and try again." });
    }

    const [updatedCount] = await User.update(
      {
        password: await bcrypt.hash(newPassword, 10),
        otpHash: null,
        otpExpiresAt: null,
      },
      { where: { id: user.id, otpHash: user.otpHash } },
    );
    if (!updatedCount) {
      return res.status(400).json({
        message:
          "The reset code is invalid or has expired. Request a new code and try again.",
      });
    }
    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Unable to reset your password." });
  }
}

// GET /api/profile
export async function getProfile(req, res) {
  try {
    const userId = req.user.id; // set by your auth middleware

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // never send password hash back
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
