import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { getAnnotations } from '../services/annotations';
import { Annotation } from '../types';

interface PdfViewerProps {
  pdfUrl: string;
  pdfId: string;
  userId: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, pdfId, userId }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      const data = await getAnnotations(pdfId, userId);
      setAnnotations(data);
    };
    fetchAnnotations();
  }, [pdfId, userId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="relative">
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (_, index) => (
          <div key={index} className="relative">
            <Page pageNumber={index + 1} />
            {annotations
              .filter((a) => a.page_number === index + 1)
              .map((a) => (
                <div
                  key={a.id}
                  className="absolute bg-yellow-300 opacity-30"
                  style={{
                    left: a.highlight_coords.x,
                    top: a.highlight_coords.y,
                    width: a.highlight_coords.width,
                    height: a.highlight_coords.height,
                  }}
                  title={a.comment || 'Highlight'}
                />
              ))}
          </div>
        ))}
      </Document>
    </div>
  );
};
