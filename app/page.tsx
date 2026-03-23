"use client";

import { useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFile(file: File) {
    setStatus("uploading");
    setMessage("Processing your document...");

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStatus("done");
      setMessage(`✓ Ingested ${data.chunks} chunks from "${file.name}"`);
    } catch (err: unknown) {
      setStatus("error");
      const message = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${message}`);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-12 overflow-hidden">
      <h1 className="text-4xl font-bold font-sans text-center">
        Hi, I&apos;m <span className="text-accent">docKnowledge</span>!
      </h1>
      <p className="mt-4 text-lg font-mono text-muted text-center">
        A knowledge base for your documents, powered by AI
      </p>

      <div
        className="w-full max-w-xl mt-12 border-2 border-dashed border-white/20 rounded-xl p-12 flex flex-col items-center justify-center gap-3 hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer group"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <span className="text-4xl">
          {status === "uploading" ? "⏳" : status === "done" ? "✅" : status === "error" ? "❌" : "⬆"}
        </span>
        <span className="text-muted text-sm font-semibold group-hover:text-text transition-colors">
          {status === "idle" ? "Upload a document to get started" : message}
        </span>
        <span className="text-xs font-mono text-muted/60">
          PDF, DOCX, TXT supported
        </span>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {(status === "done" || status === "error") && (
        <button
          className="cursor-pointer mt-4 text-sm font-bold hover:bg-accent/90 bg-accent-glow border-2 border-accent rounded-3xl px-4 py-3 transition-colors"
          onClick={() => { setStatus("idle"); setMessage(""); }}
        >
          Upload another
        </button>
      )}
    </div>
  );
}