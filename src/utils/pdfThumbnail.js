import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';

// Set worker path
//@ts-ignore
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function generatePdfThumbnail(pdfUrl: string): Promise<string> {
  try {
    // Create a temporary proxy URL to handle CORS
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const dataUrl = URL.createObjectURL(blob);

    const loadingTask = getDocument({
      url: dataUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/',
      cMapPacked: true,
    });
    
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    // Scale down for thumbnail
    const scale = 400 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
    
    // Cleanup
    URL.revokeObjectURL(dataUrl);
    await pdf.destroy();
    
    return thumbnail;
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    throw error;
  }
}