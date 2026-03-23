import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
      <span className="text-6xl mb-6">📄</span>
      <h1 className="text-4xl font-bold font-sans">
        <span className="text-accent">404</span> — Page Not Found
      </h1>
      <p className="mt-4 text-muted font-mono text-sm">
        This page doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="mt-8 bg-accent hover:bg-accent/80 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}