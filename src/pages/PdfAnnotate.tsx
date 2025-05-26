/ src/pages/PdfAnnotate.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { PdfViewer } from '../components/PdfViewer';
import { AnnotationControls } from '../components/AnnotationControls';
import { ChevronLeft } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  if (!pdfUrl || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load PDF or user information</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Annotate PDF</h1>
              <p className="text-gray-600">{pdfId}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <PdfViewer pdfUrl={pdfUrl} pdfId={pdfId!} userId={userId} />
          </div>
          <div className="lg:col-span-1">
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
  );
};
