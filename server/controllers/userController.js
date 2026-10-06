import db from "../models/index.js";
const { User } = db;
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";
dotenv.config();

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //check existing user
    const user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: "user already exist" });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "all fields are required" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });

    res.status(201).json({
      status: "success",
      message: "user created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "error creating user",
    });
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
    return res.status(400).json({ message: "A Google access token is required." });
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
      return res.status(401).json({ message: "Google sign-in could not be verified." });
    }
    googleProfile = await response.json();
  } catch (error) {
    console.error("Google userinfo request failed:", error);
    return res.status(502).json({ message: "Google sign-in is temporarily unavailable." });
  }

  if (
    !googleProfile ||
    typeof googleProfile.email !== "string" ||
    googleProfile.email_verified !== true
  ) {
    return res.status(401).json({ message: "A verified Google email is required." });
  }

  try {
    let user = await User.findOne({ where: { email: googleProfile.email } });
    if (!user) {
      const password = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
      user = await User.create({
        name: googleProfile.name || googleProfile.email.split("@")[0],
        email: googleProfile.email,
        password,
      });
    }

    const token = JWT.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "5d" },
    );
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Google login failed:", error);
    return res.status(500).json({ message: "Unable to complete Google sign-in." });
  }
};


// GET /api/profile
export async function getProfile(req, res) {
  try {
    const userId = req.user.id; // set by your auth middleware
 
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }, // never send password hash back
    });
 
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
 
    res.status(200).json(user);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}