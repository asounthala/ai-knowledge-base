import { NextRequest, NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

async function getCollection() {
  const client = new ChromaClient({ host: "localhost", port: 8000, ssl: false });
  const embeddingFunction = new DefaultEmbeddingFunction();
  return client.getOrCreateCollection({ name: "documents", embeddingFunction });
}

export async function GET() {
  try {
    const collection = await getCollection();
    const results = await collection.get();

    const sources = new Map<string, { name: string; chunks: number }>();
    results.metadatas.forEach((meta) => {
      const source = (meta as { source?: string })?.source ?? "unknown";
      if (sources.has(source)) {
        sources.get(source)!.chunks += 1;
      } else {
        sources.set(source, { name: source, chunks: 1 });
      }
    });

    return NextResponse.json(Array.from(sources.values()));
  } catch (error: unknown) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Document name is required" }, { status: 400 });
    }

    const collection = await getCollection();

    // Find all chunk IDs belonging to this document
    const results = await collection.get({
      where: { source: name },
    });

    if (results.ids.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete all chunks for this document
    await collection.delete({ ids: results.ids });

    return NextResponse.json({ deleted: results.ids.length });
  } catch (error: unknown) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}