CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  pdf_id TEXT NOT NULL, -- References PDF file name or ID in Supabase storage
  page_number INTEGER NOT NULL,
  highlight_coords JSONB NOT NULL, -- Stores {x, y, width, height} for highlight
  comment TEXT, -- Optional comment for the annotation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX idx_annotations_user_pdf ON annotations (user_id, pdf_id);
