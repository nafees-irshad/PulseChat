import express from "express";
import dotenv from "dotenv";
import "./config/db.js";
import cors from 'cors'

const app = express();
dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your React frontend
    credentials: true, // Allow cookies (if needed)
  }),
);

import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

app.use("/api/user", userRoutes);
app.use("/api/gpt", chatRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is runng at ${PORT}`);
});
