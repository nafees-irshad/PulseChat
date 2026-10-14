import mammoth from "mammoth";
import { extractPdfText } from "./pdfService.js";
import { ocrPdf, ocrImages } from "./ocrService.js";

const MAX_CHARS = 30000;

// Thrown when every extraction method failed, so the controller can return a clean 422
export class NoTextError extends Error {}

const clip = (text) => text.trim().slice(0, MAX_CHARS);
const reason = (err) => err?.message ?? String(err);

// ---------- TXT ----------
function fromTxt(buffer) {
  const text = clip(buffer.toString("utf-8"));
  if (!text) throw new NoTextError("The text file is empty");
  return { text, totalPages: null, method: "txt" };
} 

// ---------- IMAGE (png/jpeg) ----------
async function fromImage(buffer) {
  const text = clip(await ocrImages([buffer]));
  if (!text) throw new NoTextError("No readable text was found in the image");
  return { text, totalPages: 1, method: "image-ocr" };
}

// ---------- PDF: text layer -> OCR -> fail ----------
async function fromPdf(buffer) {
  const failures = [];
  let weak = null; // some text was found but very little; keep it in case OCR finds nothing

  // Step 1: the PDF's own text layer (fast)
  try {
    const result = await extractPdfText(buffer);
    if (!result.isLikelyScanned) {
      return {
        text: result.text,
        totalPages: result.totalPages,
        method: "pdf-text",
      };
    }
    if (result.text) weak = result;
    failures.push("no usable text layer (looks scanned)");
  } catch (err) {
    failures.push(`text layer failed: ${reason(err)}`);
  }

  // Step 2: OCR every page (slow, but handles scanned PDFs)
  try {
    const result = await ocrPdf(buffer);
    const text = clip(result.text);
    if (text) return { text, totalPages: result.totalPages, method: "pdf-ocr" };
    failures.push("OCR found no text");
  } catch (err) {
    failures.push(`OCR failed: ${reason(err)}`);
  }

  // Step 3: OCR got nothing, but the text layer had a little: better than nothing
  if (weak)
    return {
      text: weak.text,
      totalPages: weak.totalPages,
      method: "pdf-text-partial",
    };

  throw new NoTextError(`Could not read this PDF (${failures.join("; ")})`);
}

// ---------- DOCX: body text -> OCR of embedded images -> fail ----------
async function fromDocx(buffer) {
  const failures = [];

  // Step 1: normal text in the document body
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    if (value.trim())
      return { text: clip(value), totalPages: null, method: "docx-text" };
    failures.push("no text in the document body");
  } catch (err) {
    failures.push(`text extraction failed: ${reason(err)}`);
  }

  // Step 2: a scanned .docx is usually just page images pasted in, so pull them out and OCR them
  try {
    const images = [];
    await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          if (["image/png", "image/jpeg"].includes(image.contentType)) {
            images.push(await image.read());
          }
          return { src: "" }; // we only want the bytes, not the HTML
        }),
      },
    );

    if (images.length === 0) {
      failures.push("no embedded images to OCR");
    } else {
      const text = clip(await ocrImages(images));
      if (text) return { text, totalPages: null, method: "docx-ocr" };
      failures.push("OCR found no text in the embedded images");
    }
  } catch (err) {
    failures.push(`image OCR failed: ${reason(err)}`);
  }

  throw new NoTextError(
    `Could not read this document (${failures.join("; ")})`,
  );
}

// Single entry point the controller calls. Returns { text, totalPages, method } or throws NoTextError.
export async function extractTextFromFile(buffer, mimetype) {
  if (mimetype === "application/pdf") return fromPdf(buffer);
  if (mimetype === "text/plain") return fromTxt(buffer);
  if (mimetype === "image/png" || mimetype === "image/jpeg")
    return fromImage(buffer);
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return fromDocx(buffer);
  }
  throw new Error(`Unsupported file type: ${mimetype}`);
}
