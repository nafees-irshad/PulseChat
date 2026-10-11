import { createWorker } from "tesseract.js";
import mammoth from "mammoth";
import { TextDecoder } from "node:util";
import { extractPdfText } from "./pdfService.js";

const MAX_CHARS = 30000;

// Plain text files need no extraction — just decode the buffer
function extractTxt(buffer) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer).trim();
  return {
    text: text.slice(0, MAX_CHARS),
    totalPages: null,
    isLikelyScanned: false,
  };
}

// OCR for a single image (jpg/png) — pure JS/WASM, no native binaries needed
async function extractImageText(buffer) {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    const text = data.text.trim();
    return {
      text: text.slice(0, MAX_CHARS),
      totalPages: 1,
      isLikelyScanned: text.length === 0,
    };
  } finally {
    await worker.terminate(); // always free the worker, even if recognize() throws
  }
}

// Word documents — mammoth reads the .docx XML directly, no native deps
async function extractDocxText(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  const text = value.trim();
  return {
    text: text.slice(0, MAX_CHARS),
    totalPages: null,
    isLikelyScanned: text.length === 0,
  };
}

// Single entry point the controller calls — picks the right extractor by mimetype
export async function extractTextFromFile(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    return extractPdfText(buffer);
  }
  if (mimetype === "text/plain") {
    return extractTxt(buffer);
  }
  if (mimetype === "image/png" || mimetype === "image/jpeg") {
    return extractImageText(buffer);
  }
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(buffer);
  }
  throw new Error(`Unsupported file type: ${mimetype}`);
}
