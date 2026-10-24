import express from "express";
import rateLimit from "express-rate-limit";

import {
  startConversation,
  listConversations,
  sendMessage,
  getConversationMessages,
  renameConversation,
  deleteConversation,
  sendGuestMessage,
} from "../controllers/chatController.js";
import {
  extractGuestDocument,
  deleteDocument,
  getDocument,
  getDocumentFile,
  handleUpload,
  listDocuments,
  uploadDocument,
} from "../controllers/documentController.js";

import { authenticateUser } from "../middleware/authentication.js";

const router = express.Router();

const guestChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many temporary chat requests. Please try again later." },
});
const guestDocumentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many document uploads. Please try again later." },
});

router.post("/guest/chat", guestChatLimiter, sendGuestMessage);
router.post(
  "/guest/documents/extract",
  guestDocumentLimiter,
  handleUpload,
  extractGuestDocument,
);

router.use(authenticateUser); // all chat routes require a logged-in user

router.post("/conversations", startConversation);
router.get("/conversations", listConversations);
router.patch("/conversations/:id", renameConversation);
router.delete("/conversations/:id", deleteConversation);
router.get("/conversations/:id/messages", getConversationMessages);
router.get("/documents", listDocuments);
router.delete("/documents/:id", deleteDocument);
router.get("/documents/:id", getDocument);
router.get("/documents/:id/file", getDocumentFile);
router.post("/chat", sendMessage);
router.post("/documents/extract", handleUpload, uploadDocument);

export default router;
