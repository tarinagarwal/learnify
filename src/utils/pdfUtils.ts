import { PDFDocument, rgb } from 'pdf-lib';

export const addHighlightToPDF = async (
  pdfBytes: ArrayBuffer,
  coords: { x: number; y: number; width: number; height: number },
  pageNumber: number
): Promise<ArrayBuffer> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[pageNumber - 1];

  // Add highlight annotation
  page.drawRectangle({
    x: coords.x,
    y: page.getHeight() - coords.y - coords.height, // Adjust for PDF coordinate system
    width: coords.width,
    height: coords.height,
    color: rgb(1, 1, 0), // Yellow highlight
    opacity: 0.3,
  });

  return await pdfDoc.save();
};

// Convert PDF file to ArrayBuffer for pdf-lib.js
export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};
