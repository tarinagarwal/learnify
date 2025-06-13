import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { getAnnotations } from '../services/annotations';
import { Annotation } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageSquare } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  pdfId: string;
  userId: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, pdfId, userId }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const data = await getAnnotations(pdfId, userId);
        setAnnotations(data);
      } catch (error) {
        console.error('Error fetching annotations:', error);
      }
    };
    fetchAnnotations();
  }, [pdfId, userId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const getCurrentPageAnnotations = () => {
    return annotations.filter((a) => a.page_number === currentPage);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomChange = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoom(Math.min(200, zoom + 25));
    } else {
      setZoom(Math.max(50, zoom - 25));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* PDF Viewer Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange('prev')}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-white rounded-md border min-w-[80px] text-center">
              {currentPage} / {numPages || 1}
            </span>
            <button 
              onClick={() => handlePageChange('next')}
              disabled={!numPages || currentPage >= numPages}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleZoomChange('out')}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-white rounded-md border min-w-[60px] text-center">
            {zoom}%
          </span>
          <button 
            onClick={() => handleZoomChange('in')}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="p-6 bg-gray-100 min-h-[600px] flex justify-center overflow-auto">
        <div className="relative">
          <Document 
            file={pdfUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error('PDF Load Error:', error)}
            className="shadow-lg"
          >
            <div className="relative bg-white border border-gray-300 shadow-lg">
              <Page 
                pageNumber={currentPage}
                scale={zoom / 100}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
              
              {/* Highlight Overlays */}
              {getCurrentPageAnnotations().map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute bg-yellow-300 bg-opacity-40 border-2 border-yellow-400 cursor-pointer hover:bg-opacity-60 transition-all duration-200 group"
                  style={{
                    left: `${annotation.highlight_coords.x * (zoom / 100)}px`,
                    top: `${annotation.highlight_coords.y * (zoom / 100)}px`,
                    width: `${annotation.highlight_coords.width * (zoom / 100)}px`,
                    height: `${annotation.highlight_coords.height * (zoom / 100)}px`,
                  }}
                  title={annotation.comment || 'Highlight'}
                >
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};
