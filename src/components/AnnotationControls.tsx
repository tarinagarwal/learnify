import { useState } from 'react';
import { createAnnotation } from '../services/annotations';
import { BookOpen, Palette, MessageSquare } from 'lucide-react';

interface AnnotationControlsProps {
  pdfId: string;
  pageNumber: number;
  userId: string;
  onHighlight: (coords: { x: number; y: number; width: number; height: number }) => void;
}

export const AnnotationControls: React.FC<AnnotationControlsProps> = ({
  pdfId,
  pageNumber,
  userId,
  onHighlight,
}) => {
  const [comment, setComment] = useState('');
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHighlight = async () => {
    try {
      setIsHighlighting(true);
      setIsSubmitting(true);
      
      // Placeholder coordinates; replace with mouse-based selection in production
      const coords = { x: 100, y: 100, width: 200, height: 20 };
      onHighlight(coords);
      
      await createAnnotation({
        user_id: userId,
        pdf_id: pdfId,
        page_number: pageNumber,
        highlight_coords: coords,
        comment: comment || undefined,
      });
      
      setComment('');
    } catch (error) {
      console.error('Error creating annotation:', error);
    } finally {
      setIsHighlighting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Annotation Tools
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <button
            onClick={handleHighlight}
            disabled={isHighlighting || isSubmitting}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isHighlighting || isSubmitting
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <Palette className="w-4 h-4 mr-2" />
            {isHighlighting ? 'Highlighting...' : 'Highlight Text'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your thoughts, notes, or questions here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="mb-1"><strong>Tip:</strong> Click "Highlight Text" to add a highlight at the current position.</p>
          <p>Add comments to your highlights for better organization and context.</p>
        </div>
      </div>
    </div>
  );
};
