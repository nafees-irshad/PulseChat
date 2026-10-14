import { createWorker } from "tesseract.js";
import { definePDFJSModule, getDocumentProxy, renderPageAsImage } from "unpdf";
import { fileURLToPath } from "node:url";

// renderPageAsImage needs the official PDF.js build, and this must run before other unpdf calls
await definePDFJSModule(() => import("pdfjs-dist/legacy/build/pdf.mjs"));

export const MAX_OCR_PAGES = 10; // OCR is slow on CPU, so cap how many pages/images we read
const OCR_LANGUAGES = "eng";
const OCR_LANG_PATH = fileURLToPath(new URL("../../", import.meta.url));

let workerPromise;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker(OCR_LANGUAGES, undefined, {
      langPath: OCR_LANG_PATH,
      gzip: false,
    }).catch((error) => {
      workerPromise = null;
      throw error;
    });
  }

  return workerPromise;
}

// Keep the OCR engine warm between uploads and use the bundled language data.
async function withWorker(job) {
  return job(await getWorker());
}
 
// OCR a scanned PDF: render each page to a PNG, then read the PNG
export async function ocrPdf(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const pagesToRead = Math.min(pdf.numPages, MAX_OCR_PAGES);

  return withWorker(async (worker) => {
    const parts = [];
    for (let page = 1; page <= pagesToRead; page++) {
      const png = await renderPageAsImage(pdf, page, {
        canvasImport: () => import("@napi-rs/canvas"),
        scale: 2, // higher scale = sharper image = better OCR accuracy
      });
      const { data } = await worker.recognize(Buffer.from(png));
      parts.push(data.text.trim());
    }
    return {
      text: parts.join("\n\n").trim(),
      totalPages: pdf.numPages,
    };
  });
}

// OCR a list of image buffers (used for images embedded in a scanned .docx)
export async function ocrImages(buffers) {
  return withWorker(async (worker) => {
    const parts = [];
    for (const buffer of buffers.slice(0, MAX_OCR_PAGES)) {
      const { data } = await worker.recognize(buffer);
      parts.push(data.text.trim());
    }
    return parts.join("\n\n").trim();
  });
}
