import React from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface PdfThumbnailProps {
  pdfUrl: string;
  pageNumber?: number;
  width?: number;
  onLoadSuccess?: () => void;
}

export const PdfThumbnail: React.FC<PdfThumbnailProps> = ({
  pdfUrl,
  pageNumber = 1,
  width = 150,
  onLoadSuccess,
}) => {
  return (
    <div className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border bg-card/50 backdrop-blur-sm hover:ring-2 hover:ring-primary/20">
      <div className="aspect-[3/4] bg-gradient-to-br from-muted to-primary/10 flex items-center justify-center relative">
        <Document
          file={pdfUrl}
          onLoadSuccess={onLoadSuccess}
          onLoadError={(error) => console.error('PDF Thumbnail Error:', error)}
          className="w-full h-full"
        >
          <Page
            pageNumber={pageNumber}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="w-full h-full object-contain rounded-lg"
          />
        </Document>
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/5 transition-all duration-300 rounded-xl"></div>
      </div>
    </div>
  );
};
