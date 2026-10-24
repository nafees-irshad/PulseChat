import multer from "multer";
import {
  extractTextFromFile,
  NoTextError,
} from "../service/External/textExtractionService.js";

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

export async function listDocuments(req, res) {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      attributes: [
        "id",
        "originalName",
        "originalFile",
        "totalPages",
        "conversationId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        { model: db.User, attributes: ["name"] },
        { model: db.Conversation, attributes: ["title"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(
      documents.map((document) => ({
        id: document.id,
        originalName: document.originalName,
        totalPages: document.totalPages,
        conversationId: document.conversationId,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        sizeBytes: document.originalFile
          ? Buffer.from(document.originalFile).length
          : 0,
        uploaderName: document.User?.name || "Unknown",
        conversationName: document.Conversation?.title || "No chat",
      })),
    );
  } catch (err) {
    console.error("listDocuments error:", err);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
}

export async function getDocument(req, res) {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      attributes: [
        "id",
        "originalName",
        "text",
        "originalFile",
        "totalPages",
        "conversationId",
        "createdAt",
      ],
      include: [
        { model: db.User, attributes: ["name"] },
        { model: db.Conversation, attributes: ["title"] },
      ],
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.status(200).json({
      id: document.id,
      originalName: document.originalName,
      text: document.text,
      originalFileBase64: document.originalFile
        ? Buffer.from(document.originalFile).toString("base64")
        : null,
      totalPages: document.totalPages,
      conversationId: document.conversationId,
      createdAt: document.createdAt,
      uploaderName: document.User?.name || "Unknown",
      conversationName: document.Conversation?.title || "No chat",
    });
  } catch (err) {
    console.error("getDocument error:", err);
    return res.status(500).json({ error: "Failed to fetch document" });
  }
}

export async function getDocumentFile(req, res) {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      attributes: ["originalName", "originalFile"],
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    if (!document.originalFile) {
      return res.status(404).json({ error: "Original file is not available" });
    }

    const extension = document.originalName.split(".").pop()?.toLowerCase();
    const contentTypes = {
      pdf: "application/pdf",
      txt: "text/plain; charset=utf-8",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      docx:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const contentType = contentTypes[extension];
    if (!contentType) {
      return res.status(415).json({ error: "Preview is not available for this file type" });
    }

    const fileBuffer = Buffer.isBuffer(document.originalFile)
      ? document.originalFile
      : Buffer.from(document.originalFile);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileBuffer.length);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "private, max-age=300");
    return res.status(200).send(fileBuffer);
  } catch (err) {
    console.error("getDocumentFile error:", err);
    return res.status(500).json({ error: "Failed to fetch original file" });
  }
}

export async function deleteDocument(req, res) {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    await document.destroy();
    return res.status(204).send();
  } catch (err) {
    console.error("deleteDocument error:", err);
    return res.status(500).json({ error: "Failed to delete document" });
  }
}

// POST /api/documents  (form-data: file, optional conversationId)
export async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Attach a file in the "file" field' });
  }

  try {
    // Some browsers send .txt files as application/octet-stream, so trust the extension
    const mimetype = req.file.originalname.toLowerCase().endsWith(".txt")
      ? "text/plain"
      : req.file.mimetype;

    // Tries the normal text extraction first, then OCR (scanned PDFs, scanned DOCX, images).
    // Returns { text, totalPages, method } or throws NoTextError when every method failed.
    let result;
    try {
      result = await extractTextFromFile(req.file.buffer, mimetype);
    } catch (err) {
      if (err instanceof NoTextError) {
        console.warn("No text could be extracted:", err.message);
        return res.status(422).json({
          error:
            "No readable text could be extracted from this file, even with OCR. Try a clearer scan or a different file.",
          details: err.message, // which steps were tried and why each failed
        });
      }
      throw err; // anything else is unexpected, so let the outer catch return a 500
    }

    const document = await Document.create({
      userId: req.user.id,
      conversationId: req.body.conversationId || null,
      originalName: req.file.originalname,
      text: result.text,
      originalFile: req.file.buffer,
      totalPages: result.totalPages,
    });

    // Don't send the full text back — the client only needs the id from now on
    res.status(201).json({
      documentId: document.id,
      originalName: document.originalName,
      totalPages: document.totalPages,
      method: result.method, // e.g. "pdf-text", "pdf-ocr", "docx-ocr", "image-ocr", "txt"
    });
  } catch (err) {
    console.error("uploadDocument error:", err);
    res.status(500).json({ error: "Failed to process the file" });
  }
}

// POST /api/gpt/guest/documents/extract (extracts without creating a DB record)
export async function extractGuestDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Attach a file in the "file" field' });
  }

  try {
    const mimetype = req.file.originalname.toLowerCase().endsWith(".txt")
      ? "text/plain"
      : req.file.mimetype;
    const result = await extractTextFromFile(req.file.buffer, mimetype);
    return res.status(200).json({
      text: result.text,
      originalName: req.file.originalname,
      totalPages: result.totalPages,
      method: result.method,
    });
  } catch (err) {
    if (err instanceof NoTextError) {
      console.warn("No text could be extracted from temporary upload:", err.message);
      return res.status(422).json({
        error:
          "No readable text could be extracted from this file, even with OCR. Try a clearer scan or a different file.",
        details: err.message,
      });
    }
    console.error("extractGuestDocument error:", err);
    return res.status(500).json({ error: "Failed to process the file" });
  }
}
