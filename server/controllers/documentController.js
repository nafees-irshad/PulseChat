import multer from "multer";
import { extractTextFromFile } from "../service/External/textExtractionService.js";

import db from "../models/index.js"; // adjust path to match your project

const { Document } = db;

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/octet-stream",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const isTextFile = file.originalname.toLowerCase().endsWith(".txt");
    const isSupportedTextMimeType =
      isTextFile &&
      ["text/plain", "application/octet-stream"].includes(file.mimetype);
    const isSupportedUploadType =
      (ALLOWED_TYPES.includes(file.mimetype) &&
        file.mimetype !== "application/octet-stream") ||
      isSupportedTextMimeType;

    if (isSupportedUploadType) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, TXT, DOCX, PNG, or JPEG files are allowed"));
    }
  },
});

export function handleUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

// POST /api/documents  (form-data: file, optional conversationId)
export async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Attach a file in the "file" field' });
  }

  try {
    let result;
    try {
      const mimetype = req.file.originalname.toLowerCase().endsWith(".txt")
        ? "text/plain"
        : req.file.mimetype;
      result = await extractTextFromFile(req.file.buffer, mimetype);
    } catch (err) {
      console.warn("Could not read uploaded document:", err.message);
      return res.status(422).json({
        error:
          "The uploaded file is invalid or could not be read. Choose a valid PDF, DOCX, or TXT file.",
      });
    }

    if (result.isLikelyScanned) {
      return res.status(422).json({
        error:
          req.file.mimetype === "application/pdf"
            ? "No text could be extracted. If this is a scanned PDF, try uploading it as an image (JPG/PNG) instead."
            : "No readable text could be extracted from this file. Choose a valid PDF, DOCX, or TXT document.",
      });
    }

    if (!result.text.trim()) {
      return res.status(422).json({
        error: "No readable text could be extracted from this file.",
      });
    }

    const document = await Document.create({
      userId: req.user.id,
      conversationId: req.body.conversationId || null,
      originalName: req.file.originalname,
      text: result.text,
      totalPages: result.totalPages,
    });

    // Don't send the full text back — the client only needs the id from now on
    res.status(201).json({
      documentId: document.id,
      originalName: document.originalName,
      totalPages: document.totalPages,
    });
  } catch (err) {
    console.error("uploadDocument error:", err);
    res.status(500).json({ error: "Failed to process the file" });
  }
}
