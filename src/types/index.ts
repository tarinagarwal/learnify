export interface Annotation {
  id: string;
  user_id: string;
  pdf_id: string;
  page_number: number;
  highlight_coords: { x: number; y: number; width: number; height: number };
  comment?: string;
  created_at: string;
}

// ... other existing types (e.g., Course, Quiz, User)
export interface Course {
  id: string;
  title: string;
  description: string;
  // ... other fields
}

// Add more existing types as needed
