export function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    let i = 0;
    while (i < words.length) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        chunks.push(chunk);
        i += chunkSize - overlap; // Move forward by chunkSize minus the overlap
    }

    return chunks.filter((chunk) => chunk.trim().length > 0); // Remove empty chunks
}