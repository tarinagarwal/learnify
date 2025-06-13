import { useState } from 'react';
import { createAnnotation } from '../services/annotations';
import { BookOpen, Palette, MessageSquare, Sparkles, Loader2 } from 'lucide-react';

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
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:ring-2 hover:ring-primary/20 transition-all duration-300">
      <div className="bg-gradient-to-r from-muted to-primary/10 px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center">
          <div className="p-1.5 bg-primary/20 rounded-full mr-3">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
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
                ? 'bg-yellow-500/10 text-yellow-600 border-2 border-yellow-500/30 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg'
            }`}
          >
            {isHighlighting || isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Palette className="w-4 h-4 mr-2" />
            )}
            {isHighlighting ? 'Highlighting...' : 'Highlight Text'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Add Comment
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your thoughts, notes, or questions here..."
              className="w-full pl-10 pr-3 py-3 bg-input border border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200"
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="bg-muted/50 border border-border p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-primary/20 rounded-full flex-shrink-0 mt-0.5">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">
                <strong>Tip:</strong> Click "Highlight Text" to add a highlight at the current position.
              </p>
              <p>Add comments to your highlights for better organization and context.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
