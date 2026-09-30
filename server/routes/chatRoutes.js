import express from "express";

import {
  startConversation,
  listConversations,
  sendMessage,
  getConversationMessages,
  renameConversation,
  deleteConversation,
} from "../controllers/chatController.js";
import {
  handleUpload,
  uploadDocument,
} from "../controllers/documentController.js";

import { authenticateUser } from "../middleware/authentication.js";

const router = express.Router();

router.use(authenticateUser); // all chat routes require a logged-in user

router.post("/conversations", startConversation);
router.get("/conversations", listConversations);
router.patch("/conversations/:id", renameConversation);
router.delete("/conversations/:id", deleteConversation);
router.get("/conversations/:id/messages", getConversationMessages);
router.post("/chat", sendMessage);
router.post("/documents/extract", handleUpload, uploadDocument);

export default router;
