import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { PdfViewer } from '../components/PdfViewer';
import { AnnotationControls } from '../components/AnnotationControls';

export const PdfAnnotate: React.FC = () => {
  const { pdfId } = useParams<{ pdfId: string }>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const fetchPdfAndUser = async () => {
      // Fetch user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Fetch PDF from Supabase storage
      if (pdfId) {
        const { data, error } = await supabase.storage
          .from('pdfs')
          .getPublicUrl(`pdfs/${pdfId}`);
        if (!error && data) setPdfUrl(data.publicUrl);
      }
    };
    fetchPdfAndUser();
  }, [pdfId]);

  const handleHighlight = (coords: { x: number; y: number; width: number; height: number }) => {
    // Handle highlight logic (e.g., update local state or trigger re-render)
    console.log('Highlight added:', coords);
  };

  if (!pdfUrl || !userId) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Annotate PDF</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <PdfViewer pdfUrl={pdfUrl} pdfId={pdfId!} userId={userId} />
        </div>
        <div className="col-span-1">
          <AnnotationControls
            pdfId={pdfId!}
            pageNumber={pageNumber}
            userId={userId}
            onHighlight={handleHighlight}
          />
        </div>
      </div>
    </div>
  );
};
