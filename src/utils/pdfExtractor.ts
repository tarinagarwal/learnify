import { getDocument } from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: unknown) => item.str).join(" ");
      fullText += pageText + " ";
    }

    await pdf.destroy();
    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}
