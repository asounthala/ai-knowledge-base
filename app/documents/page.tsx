"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Document {
  name: string;
  chunks: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function deleteDocument(name: string) {
    setDeleting(name);
    try {
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to delete");
      setDocuments((prev) => prev.filter((d) => d.name !== name));
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setDeleting(null);
    }
  }

  function getFileIcon(name: string) {
    if (name.endsWith(".pdf")) return "📕";
    if (name.endsWith(".docx")) return "📘";
    if (name.endsWith(".txt")) return "📄";
    return "📁";
  }

  return (
    <div className="flex flex-1 flex-col p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Your <span className="text-accent">Documents</span>
          </h1>
          <p className="text-muted text-sm font-mono mt-1">
            {documents.length} document{documents.length !== 1 ? "s" : ""} ingested
          </p>
        </div>
        <Link
          href="/"
          className="bg-accent hover:bg-accent/80 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + Upload New
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted text-sm animate-pulse">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <span className="text-5xl">📭</span>
          <p className="text-muted text-sm">No documents uploaded yet.</p>
          <Link href="/" className="text-accent text-sm underline">
            Upload your first document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.name}
              className="group bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start gap-3 overflow-hidden">
                <span className="text-2xl shrink-0">{getFileIcon(doc.name)}</span>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{doc.name}</p>
                  <p className="text-xs font-mono text-muted mt-1">
                    {doc.chunks} chunk{doc.chunks !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => deleteDocument(doc.name)}
                disabled={deleting === doc.name}
                className="opacity-0 group-hover:opacity-100 shrink-0 text-muted hover:text-red-400 disabled:text-muted/40 transition-all text-xs pt-0.5"
              >
                {deleting === doc.name ? "..." : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}