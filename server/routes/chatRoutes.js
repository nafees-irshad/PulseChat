import express from "express";

import {
  startConversation,
  listConversations,
  sendMessage,
  getConversationMessages,
} from "../controllers/chatController.js";

import { authenticateUser } from "../middleware/authentication.js";

const router = express.Router();

router.use(authenticateUser); // all chat routes require a logged-in user

router.post("/conversations", startConversation);
router.get("/conversations", listConversations);
router.get("/conversations/:id/messages", getConversationMessages);
router.post("/chat", sendMessage);

export default router;
