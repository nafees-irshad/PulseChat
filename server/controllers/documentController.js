import multer from "multer";
// import { extractPdfText } from '../services/pdfService.js';
import { extractPdfText } from "../service/External/pdfService.js";

import db from "../models/index.js"; // adjust path to match your project

const { Document } = db;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
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
    return res.status(400).json({ error: 'Attach a PDF in the "file" field' });
  }

  try {
    const result = await extractPdfText(req.file.buffer);

    if (result.isLikelyScanned) {
      return res.status(422).json({
        error:
          "This PDF looks scanned (images only), so no text could be extracted",
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
    res.status(500).json({ error: "Failed to process the PDF" });
  }
}
