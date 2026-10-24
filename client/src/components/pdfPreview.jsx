import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function PdfPreview({ file }) {
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState("");
  const pdfFile = useMemo(() => ({ data: file }), [file]);
  const pageWidth =
    typeof window === "undefined"
      ? 800
      : Math.max(
          280,
          Math.min(
            1000,
            window.innerWidth - (window.innerWidth < 700 ? 40 : 80),
          ),
        );

  return (
    <div className="library-pdf-preview">
      <Document
        file={pdfFile}
        onLoadSuccess={({ numPages }) => {
          setPageCount(numPages);
          setError("");
        }}
        onLoadError={(loadError) => {
          console.error("PDF preview error:", loadError);
          setError("The PDF could not be displayed.");
        }}
        loading={<p>Loading PDF…</p>}
        error={<p role="alert">{error || "The PDF could not be displayed."}</p>}
      >
        {Array.from({ length: pageCount }, (_, index) => (
          <Page
            key={`pdf-page-${index + 1}`}
            pageNumber={index + 1}
            width={pageWidth}
            renderTextLayer
            renderAnnotationLayer
          />
        ))}
      </Document>
    </div>
  );
}

export default PdfPreview;
