/** @format */
import db from "../models/index.js";
const { User } = db;

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authenticateUser = async (req, res, next) => {
  try {
    //get the authorization header from request
    const { authorization } = req.headers;
    // console.log(req.headers);

    //check if authorization header is present and starts with bearer
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "failed",
        message: "Unauthroized user. No token",
      });
    }
    //extract token
    const token = authorization.split(" ")[1];

    //verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    //verify id
    const userId = decode.id;
    if (!userId) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid token - no user ID",
      });
    }

    //fetch user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    //check if user exists
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "user not found",
      });
    }

    //attach the user object to request object
    req.user = user;

    //proceed to next middleware route
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: "failed",
      message: "Authentication failed. Invalid or expired token.",
    });
  }
};
