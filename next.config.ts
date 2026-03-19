import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["chromadb", "@chroma-core/default-embed"],
};

export default nextConfig;
