import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "docKnowledge",
  description: "A knowledge base for your documents, powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-bg text-text overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}