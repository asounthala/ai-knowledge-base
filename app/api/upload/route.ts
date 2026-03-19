import { NextRequest, NextResponse } from "next/server";
import { extractText } from "@/lib/extractText";
import { chunkText } from "@/lib/chunkText";
import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // 1. Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Extract text from the file
        const rawText = await extractText(buffer, file.type);

        // 3. Chunk the extracted text
        const chunks = chunkText(rawText);

        // 4. Store chunks in ChromaDB
        const client = new ChromaClient({ path: "http://localhost:8000" });
        const embeddingFunction = new DefaultEmbeddingFunction();

        const collection = await client.getOrCreateCollection({
            name: "documents",
            embeddingFunction,
        });

        await collection.add({
            ids: chunks.map((_, i) => `${file.name}-chunk-${i}`),
            documents: chunks,
            metadatas: chunks.map(() => ({ source: file.name })),
        });
        
        return NextResponse.json({ message: "File processed successfully", chunks: chunks.length });
    } catch (error: unknown) {
        console.error("Error processing file:", error);
        return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
    }
}
 
