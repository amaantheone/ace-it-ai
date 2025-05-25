import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/**
 * Processes a PDF buffer, splits it into chunks, and returns concatenated text.
 * @param buffer Buffer containing PDF data
 * @returns Promise<string> Concatenated text from all chunks
 */
export async function processPDF(buffer: Buffer): Promise<string> {
  // Use PDFLoader to load the PDF from buffer
  // PDFLoader expects a Blob or string path, so convert Buffer to Blob
  const blob = new Blob([buffer], { type: "application/pdf" });
  const loader = new PDFLoader(blob);
  const docs = await loader.load();

  // Split the loaded documents into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(docs);

  // Concatenate all text chunks
  return splitDocs.map((doc: { pageContent: string }) => doc.pageContent).join("\n\n");
}
