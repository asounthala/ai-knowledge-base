import mammoth from "mammoth";
import PDFParser from "pdf2json";

function parsePdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err: Error | { parserError: Error }) => {
      reject(err instanceof Error ? err : err.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((textObj) =>
          textObj.R.map((r) => decodeURIComponent(r.T)).join("")
        ).join(" ")
      ).join("\n");
      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    return parsePdf(buffer);
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}