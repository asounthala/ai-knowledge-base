import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

export interface QueryResult {
    text: string;
    source: string;
    distance: number;
}

function sanitizeText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

export async function queryDocuments(
    question: string,
    nResults = 4
): Promise<QueryResult[]> {
    const client = new ChromaClient({ host: "localhost", port: 8000, ssl: false });
    const embeddingFunction = new DefaultEmbeddingFunction();

    const collection = await client.getOrCreateCollection({
        name: "documents",
        embeddingFunction,
    });

    const results = await collection.query({
        queryTexts: [question],
        nResults,
    });

    const text = results.documents[0] ?? [];
    const metadatas = results.metadatas[0] ?? [];
    const distances = results.distances[0] ?? [];

    return text.map((text, i) => ({
        text: sanitizeText(text ?? ""),
        source: (metadatas[i] as { source?: string })?.source ?? "unknown",
        distance: distances[i] ?? 0,
    })) 
}
