import { useState } from 'react';
import { createAnnotation } from '../services/annotations';

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

  const handleHighlight = async () => {
    setIsHighlighting(true);
    // Simplified: In practice, use mouse events to capture coords
    const coords = { x: 100, y: 100, width: 200, height: 20 }; // Placeholder
    onHighlight(coords);
    await createAnnotation({
      user_id: userId,
      pdf_id: pdfId,
      page_number: pageNumber,
      highlight_coords: coords,
      comment: comment || undefined,
    });
    setComment('');
    setIsHighlighting(false);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <button
        onClick={handleHighlight}
        className={`px-4 py-2 ${isHighlighting ? 'bg-yellow-300' : 'bg-blue-500'} text-white rounded`}
      >
        {isHighlighting ? 'Confirm Highlight' : 'Highlight Text'}
      </button>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="mt-2 p-2 w-full border rounded"
      />
    </div>
  );
};
