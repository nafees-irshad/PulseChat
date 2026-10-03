import express from "express";
import dotenv from "dotenv";
import "./config/db.js";
import cors from "cors";

const app = express();
dotenv.config();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://pulsechatai.netlify.app",
  "https://pulsechat-ai.online",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
