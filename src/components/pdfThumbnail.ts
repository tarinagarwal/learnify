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
    <div className="overflow-hidden rounded-md shadow-md">
      <Document
        file={pdfUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadError={(error) => console.error('PDF Thumbnail Error:', error)}
      >
        <Page
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
};
