import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { getAnnotations } from '../services/annotations';
import { Annotation } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageSquare, FileText, Sparkles } from 'lucide-react';

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
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center h-96 p-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <FileText className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">Loading PDF Document...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare your document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:ring-2 hover:ring-primary/20 transition-all duration-300">
      {/* PDF Viewer Header */}
      <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-2 border border-border">
            <button 
              onClick={() => handlePageChange('prev')}
              disabled={currentPage <= 1}
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-foreground px-3 py-1 bg-background rounded-md border border-border min-w-[80px] text-center">
              {currentPage} / {numPages || 1}
            </span>
            <button 
              onClick={() => handlePageChange('next')}
              disabled={!numPages || currentPage >= numPages}
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-2 border border-border">
          <button 
            onClick={() => handleZoomChange('out')}
            className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-foreground px-3 py-1 bg-background rounded-md border border-border min-w-[60px] text-center">
            {zoom}%
          </span>
          <button 
            onClick={() => handleZoomChange('in')}
            className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="p-6 bg-muted/20 min-h-[600px] flex justify-center overflow-auto relative">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
        
        <div className="relative z-10">
          <Document 
            file={pdfUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error('PDF Load Error:', error)}
            className="shadow-xl rounded-lg overflow-hidden"
          >
            <div className="relative bg-background border border-border shadow-xl rounded-lg overflow-hidden">
              <Page 
                pageNumber={currentPage}
                scale={zoom / 100}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="rounded-lg"
              />
              
              {/* Highlight Overlays */}
              {getCurrentPageAnnotations().map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute bg-yellow-400/30 border-2 border-yellow-500/60 cursor-pointer hover:bg-yellow-400/50 transition-all duration-200 group rounded-sm"
                  style={{
                    left: `${annotation.highlight_coords.x * (zoom / 100)}px`,
                    top: `${annotation.highlight_coords.y * (zoom / 100)}px`,
                    width: `${annotation.highlight_coords.width * (zoom / 100)}px`,
                    height: `${annotation.highlight_coords.height * (zoom / 100)}px`,
                  }}
                  title={annotation.comment || 'Highlight'}
                  role="button"
                  tabIndex={0}
                  aria-label={`Annotation: ${annotation.comment || 'Highlight'}`}
                >
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-yellow-600">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  {annotation.comment && (
                    <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg p-3 shadow-xl max-w-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 text-card-foreground text-sm">
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-card border-l border-t border-border transform rotate-45"></div>
                      {annotation.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};
