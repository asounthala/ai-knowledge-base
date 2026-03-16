import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "docKnowledge",
  description: "A knowledge base for your documents, powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-mono antialiased flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
