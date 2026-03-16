import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      <Sidebar />

      <main className="flex flex-1 flex-col items-center justify-center p-12 overflow-hidden">
        <h1 className="text-4xl font-bold font-sans text-center">
          Hi, I&apos;m <span className="text-accent">docKnowledge</span>!
        </h1>
        <p className="mt-4 text-lg font-mono text-muted text-center">
          A knowledge base for your documents, powered by AI
        </p>

        <div className="w-full max-w-xl mt-12 border-2 border-dashed border-white/20 rounded-xl p-12 flex flex-col items-center justify-center gap-3 hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer group">
          <span className="text-4xl">⬆</span>
          <span className="text-muted text-sm font-semibold group-hover:text-text transition-colors">
            Upload a document to get started
          </span>
          <span className="text-xs font-mono text-muted/60">
            PDF, DOCX, TXT supported
          </span>
        </div>
      </main>
    </div>
  );
}