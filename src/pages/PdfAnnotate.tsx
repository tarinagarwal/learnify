import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { PdfViewer } from '../components/PdfViewer';
import { AnnotationControls } from '../components/AnnotationControls';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';

export const PdfAnnotate: React.FC = () => {
  const { pdfId } = useParams<{ pdfId: string }>();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfAndUser = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(`Failed to get user: ${userError.message}`);
        if (user) setUserId(user.id);

        // Get PDF URL
        if (pdfId) {
          const { data, error: pdfError } = await supabase.storage
            .from('pdfs')
            .getPublicUrl(`pdfs/${pdfId}`);
          if (pdfError) throw new Error(`Failed to get PDF URL: ${pdfError.message}`);
          setPdfUrl(data.publicUrl);
        }
      } catch (err) {
        console.error('Error fetching PDF and user:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPdfAndUser();
  }, [pdfId]);

  const handleHighlight = (coords: { x: number; y: number; width: number; height: number }) => {
    console.log('Highlight added:', coords);
    // Refresh annotations after adding highlight
    // This would typically trigger a re-fetch of annotations in the PdfViewer component
  };

  const handleBack = () => {
    navigate('/resources');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <p className="text-xl text-foreground">Loading PDF...</p>
          <p className="text-muted-foreground mt-2">Please wait while we prepare your document</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-destructive/20 border border-destructive rounded-lg p-6 mb-6">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="font-bold text-destructive text-lg mb-2">Error Loading PDF</p>
            <p className="text-destructive-foreground">{error}</p>
          </div>
          <button 
            onClick={handleBack}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200 font-medium"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  if (!pdfUrl || !userId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-foreground mb-2">Unable to Load Content</p>
          <p className="text-muted-foreground mb-6">Unable to load PDF or user information</p>
          <button 
            onClick={handleBack}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200 font-medium"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">PDF Annotation Studio</h1>
              <p className="text-muted-foreground mt-1">
                Document: <span className="text-primary font-medium">{pdfId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* PDF Viewer Section */}
          <div className="lg:col-span-3">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-card-foreground">Document Viewer</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-sm font-medium">
                    {pageNumber}
                  </span>
                </div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
                <PdfViewer pdfUrl={pdfUrl} pdfId={pdfId!} userId={userId} />
              </div>
            </div>
          </div>

          {/* Annotation Controls Section */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-lg sticky top-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">Annotation Tools</h2>
              <AnnotationControls
                pdfId={pdfId!}
                pageNumber={pageNumber}
                userId={userId}
                onHighlight={handleHighlight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
