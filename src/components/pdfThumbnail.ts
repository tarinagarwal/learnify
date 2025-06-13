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
    <div className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 bg-white">
      <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
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
            className="w-full h-full object-contain"
          />
        </Document>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-t-xl"></div>
      </div>
    </div>
  );
};
