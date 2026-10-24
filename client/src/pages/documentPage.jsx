import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Ellipsis,
  Eye,
  FileCode2,
  FileImage,
  FileText,
  Info,
  LoaderCircle,
  MessageCirclePlus,
  MessagesSquare,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteDocument,
  getDocument,
  getDocumentFile,
  listDocuments,
} from "../api/documentApi.js";
import { listConversations } from "../api/conversationApi.js";
import ConversationCard from "../components/conversationCard.jsx";
import "./documentPage.css";

const PdfPreview = lazy(() => import("../components/pdfPreview.jsx"));
const DOCUMENT_TABS = ["Suggested", "Documents", "Images", "All"];
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp"]);

function getFileExtension(name = "") {
  return name.split(".").pop()?.toLowerCase() || "";
}

function formatDate(date) {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(sizeBytes = 0) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(sizeBytes >= 10 * 1024 ? 0 : 1)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function decodeBase64File(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function DocumentIcon({ document, large = false }) {
  const extension = getFileExtension(document.originalName);
  const Icon = IMAGE_EXTENSIONS.has(extension)
    ? FileImage
    : ["js", "jsx", "ts", "tsx", "json", "css", "html", "py"].includes(
          extension,
        )
      ? FileCode2
      : FileText;

  return (
    <Icon
      aria-hidden="true"
      className={`library-document-icon${large ? " library-document-icon-large" : ""}${IMAGE_EXTENSIONS.has(extension) ? " is-image" : ""}`}
    />
  );
}

function DocumentPage() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("Suggested");
  const [searchValue, setSearchValue] = useState("");
  const [documentDetails, setDocumentDetails] = useState(null);
  const [error, setError] = useState("");
  const [documentError, setDocumentError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentMenuOpen, setIsDocumentMenuOpen] = useState(false);
  const [isFileInfoOpen, setIsFileInfoOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    let isActive = true;
    Promise.allSettled([listDocuments(), listConversations()])
      .then(([documentResult, conversationResult]) => {
        if (!isActive) return;
        if (documentResult.status === "fulfilled") {
          setDocuments(
            Array.isArray(documentResult.value) ? documentResult.value : [],
          );
        } else {
          setError(
            documentResult.reason.response?.data?.error ||
              "Could not load your documents.",
          );
        }

        if (conversationResult.status === "fulfilled") {
          const result = conversationResult.value;
          setConversations(
            Array.isArray(result)
              ? result
              : Array.isArray(result?.conversations)
                ? result.conversations
                : [],
          );
        } else {
          setError((currentError) =>
            currentError
              ? `${currentError} Chat history could not be loaded.`
              : "Chat history could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (openMenuId === null) return undefined;

    function closeMenuOnOutsideClick(event) {
      if (!event.target.closest?.("[data-library-menu]")) {
        setOpenMenuId(null);
      }
    }

    function closeMenuOnEscape(event) {
      if (event.key === "Escape") setOpenMenuId(null);
    }

    document.addEventListener("pointerdown", closeMenuOnOutsideClick);
    document.addEventListener("keydown", closeMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, [openMenuId]);

  const visibleDocuments = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return documents.filter((document) => {
      const extension = getFileExtension(document.originalName);
      const isImage = IMAGE_EXTENSIONS.has(extension);
      const matchesTab =
        activeTab === "All" ||
        activeTab === "Suggested" ||
        (activeTab === "Images" && isImage) ||
        (activeTab === "Documents" && !isImage);
      return (
        matchesTab &&
        (!normalizedSearch ||
          document.originalName.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [activeTab, documents, searchValue]);

  useEffect(() => {
    if (!documentId) {
      return;
    }
    let isActive = true;

    async function loadSelectedDocument() {
      try {
        const details = await getDocument(documentId);
        if (!isActive) return;
        setDocumentDetails(details);
        setDocumentError(null);
      } catch (requestError) {
        if (isActive) {
          setDocumentError({
            id: documentId,
            message:
              requestError.response?.data?.error ||
              "Could not open this document.",
          });
        }
      }
    }

    loadSelectedDocument();
    return () => {
      isActive = false;
    };
  }, [documentId]);

  const selectedDocument =
    documentId && String(documentDetails?.id) === documentId
      ? documentDetails
      : null;
  const activeDocumentError =
    documentError && documentError.id === documentId
      ? documentError.message
      : selectedDocument &&
          getFileExtension(selectedDocument.originalName) === "pdf" &&
          !selectedDocument.originalFileBase64
        ? "Original PDF is unavailable for this older upload; showing extracted text."
        : "";
  const activePdf = useMemo(
    () =>
      selectedDocument?.originalFileBase64
        ? decodeBase64File(selectedDocument.originalFileBase64)
        : null,
    [selectedDocument],
  );

  async function handleDownloadDocument() {
    if (!selectedDocument || isDownloading) return;
    setIsDownloading(true);
    try {
      if (!selectedDocument.originalFileBase64) {
        throw new Error("The original file is unavailable for download.");
      }
      const file = decodeBase64File(selectedDocument.originalFileBase64);
      const mimeType =
        getFileExtension(selectedDocument.originalName) === "pdf"
          ? "application/pdf"
          : "application/octet-stream";
      const blob = new Blob([file], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = selectedDocument.originalName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setDocumentError({
        id: documentId,
        message: requestError.message || "Could not download the file.",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDownloadFromList(document) {
    if (isDownloading) return;
    setIsDownloading(true);
    setOpenMenuId(null);
    setError("");
    try {
      const file = await getDocumentFile(document.id);
      const url = URL.createObjectURL(file);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Could not download the file.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDeleteDocument(document) {
    setOpenMenuId(null);
    if (
      !window.confirm(
        `Delete "${document.originalName}" from your library? This cannot be undone.`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await deleteDocument(document.id);
      setDocuments((current) =>
        current.filter((item) => String(item.id) !== String(document.id)),
      );
      window.dispatchEvent(new Event("pulsechat:documents-updated"));
      if (String(documentId) === String(document.id)) {
        setDocumentDetails(null);
        navigate("/library", { replace: true });
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Could not delete the document.",
      );
    }
  }

  function startDocumentChat(document) {
    setOpenMenuId(null);
    navigate(`/chat/document/${document.id}`);
  }

  function returnToOriginalChat(document) {
    if (!document.conversationId) return;
    setOpenMenuId(null);
    navigate(`/chat/document/${document.id}/${document.conversationId}`);
  }

  function closeDocumentViewer() {
    navigate("/library", { replace: true });
  }

  return (
    <div className="library-layout">
      <aside className="library-sidebar">
        <ConversationCard
          conversations={conversations}
          isLoading={isLoading}
          onNewChat={() => navigate("/")}
          onSelectConversation={(conversation) =>
            navigate(`/chat/${conversation.id}`)
          }
        />
      </aside>
      <main className="library-page">
        <header className="library-header">
          <h1>Library</h1>
          <label className="library-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search library"
              aria-label="Search library"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                aria-label="Clear search"
              >
                <X aria-hidden="true" />
              </button>
            )}
          </label>
        </header>

        <nav className="library-tabs" aria-label="Document categories">
          {DOCUMENT_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeTab === tab}
              className={activeTab === tab ? "is-active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="library-content" aria-live="polite">
          {error && (
            <p className="library-error" role="alert">
              {error}
            </p>
          )}
          {isLoading ? (
            <div className="library-loading">
              <LoaderCircle aria-hidden="true" className="animate-spin" />
              <span>Loading your library…</span>
            </div>
          ) : visibleDocuments.length ? (
            <div className="library-list" role="table" aria-label="Library files">
              <div className="library-list-header" role="row">
                <span role="columnheader">Name</span>
                <span role="columnheader">Modified</span>
                <span role="columnheader">Size</span>
                <span aria-hidden="true" />
              </div>
              {visibleDocuments.map((document) => (
                <div className="library-list-row" role="row" key={document.id}>
                  <button
                    type="button"
                    className="library-list-open"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === document.id ? null : document.id,
                      )
                    }
                    aria-expanded={openMenuId === document.id}
                    aria-label={`Show options for ${document.originalName}`}
                  >
                    <span className="library-list-name" role="cell">
                      <DocumentIcon document={document} />
                      <span title={document.originalName}>
                        {document.originalName}
                      </span>
                    </span>
                    <span className="library-list-modified" role="cell">
                      {formatDate(document.updatedAt || document.createdAt)}
                    </span>
                    <span className="library-list-size" role="cell">
                      {formatFileSize(document.sizeBytes)}
                    </span>
                  </button>
                  <div
                    className="library-row-menu-wrap"
                    data-library-menu
                    role="cell"
                  >
                    <button
                      type="button"
                      className="library-row-menu-trigger"
                      aria-label={`More options for ${document.originalName}`}
                      aria-expanded={openMenuId === document.id}
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === document.id ? null : document.id,
                        )
                      }
                    >
                      <Ellipsis aria-hidden="true" />
                    </button>
                    {openMenuId === document.id && (
                      <div className="library-row-menu" role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => startDocumentChat(document)}
                        >
                          <MessageCirclePlus aria-hidden="true" />
                          Ask AI
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!document.conversationId}
                          title={
                            document.conversationId
                              ? "Continue the previous conversation"
                              : "This document has no previous conversation"
                          }
                          onClick={() => returnToOriginalChat(document)}
                        >
                          <MessagesSquare aria-hidden="true" />
                          Go to original chat
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/library/${document.id}`);
                          }}
                        >
                          <Eye aria-hidden="true" />
                          View
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={isDownloading}
                          onClick={() => handleDownloadFromList(document)}
                        >
                          <Download aria-hidden="true" />
                          Download
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="is-destructive"
                          onClick={() => handleDeleteDocument(document)}
                        >
                          <Trash2 aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="library-empty">
              <FileText aria-hidden="true" />
              <h2>
                {searchValue ? "No matching documents" : "Your library is empty"}
              </h2>
              <p>
                {searchValue
                  ? "Try a different search."
                  : "Documents you upload in chats will appear here."}
              </p>
            </div>
          )}
        </section>
      </main>

      {documentId && (
        <div
          className="library-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDocumentViewer();
          }}
        >
          <section
            className="library-reader-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={selectedDocument?.originalName || "Document viewer"}
          >
            <header className="library-reader-header">
              <div className="library-document-menu-wrap">
                <button
                  type="button"
                  className="library-document-title"
                  onClick={() => setIsDocumentMenuOpen((open) => !open)}
                  aria-expanded={isDocumentMenuOpen}
                  disabled={!selectedDocument}
                >
                  {selectedDocument && (
                    <DocumentIcon document={selectedDocument} />
                  )}
                  <span>
                    {selectedDocument?.originalName || "Loading document…"}
                  </span>
                  <ChevronDown aria-hidden="true" />
                </button>
                {isDocumentMenuOpen && selectedDocument && (
                  <div className="library-document-menu">
                    <div className="library-menu-document">
                      <DocumentIcon document={selectedDocument} />
                      <div>
                        <strong>{selectedDocument.originalName}</strong>
                        <span>Library</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDocumentMenuOpen(false);
                        setIsFileInfoOpen(true);
                      }}
                    >
                      <Info aria-hidden="true" />
                      File info
                    </button>
                  </div>
                )}
              </div>
              <div className="library-reader-actions">
                <button
                  type="button"
                  onClick={handleDownloadDocument}
                  disabled={!selectedDocument || isDownloading}
                  aria-label="Download document"
                  title="Download"
                >
                  {isDownloading ? (
                    <LoaderCircle aria-hidden="true" className="animate-spin" />
                  ) : (
                    <Download aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeDocumentViewer}
                  aria-label="Close document"
                  title="Close"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            </header>
            <div className="library-reader-content" aria-live="polite">
              {!selectedDocument ? (
                activeDocumentError ? (
                  <p className="library-error" role="alert">
                    {activeDocumentError}
                  </p>
                ) : (
                  <div className="library-loading">
                    <LoaderCircle aria-hidden="true" className="animate-spin" />
                    <span>Opening document…</span>
                  </div>
                )
              ) : (
                <>
                  {activeDocumentError && (
                    <div className="library-document-notice" role="status">
                      {activeDocumentError}
                    </div>
                  )}
                  {getFileExtension(selectedDocument.originalName) === "pdf" &&
                  activePdf ? (
                    <Suspense
                      fallback={
                        <div className="library-loading">
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                          />
                          <span>Rendering PDF…</span>
                        </div>
                      }
                    >
                      <PdfPreview
                        key={selectedDocument.id}
                        file={activePdf}
                      />
                    </Suspense>
                  ) : (
                    <pre>
                      {selectedDocument.text || "No readable text was found."}
                    </pre>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {isFileInfoOpen && selectedDocument && (
        <div
          className="library-dialog-backdrop library-info-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsFileInfoOpen(false);
          }}
        >
          <section
            className="library-info-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-file-info-title"
          >
            <header>
              <h2 id="library-file-info-title">File info</h2>
              <button
                type="button"
                className="library-dialog-close"
                onClick={() => setIsFileInfoOpen(false)}
                aria-label="Close file info"
              >
                <X aria-hidden="true" />
              </button>
            </header>
            <div className="library-info-file">
              <DocumentIcon document={selectedDocument} />
              <strong>{selectedDocument.originalName}</strong>
            </div>
            <dl>
              <div>
                <dt>Uploader</dt>
                <dd>{documentDetails?.uploaderName || selectedDocument.uploaderName}</dd>
              </div>
              <div>
                <dt>Created at</dt>
                <dd>{formatDate(documentDetails?.createdAt || selectedDocument.createdAt)}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{getFileExtension(selectedDocument.originalName).toUpperCase() || "Unknown"}</dd>
              </div>
              <div>
                <dt>Recent chat</dt>
                <dd>{documentDetails?.conversationName || selectedDocument.conversationName || "No chat"}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}

export default DocumentPage;
