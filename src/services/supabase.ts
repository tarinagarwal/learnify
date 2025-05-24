import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Get signed URL for a PDF from Supabase storage
export const getPdfSignedUrl = async (pdfId: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .createSignedUrl(`pdfs/${pdfId}`, 3600); // URL valid for 1 hour
  if (error) throw new Error(`Failed to get signed URL: ${error.message}`);
  return data.signedUrl;
};

// Upload a PDF to Supabase storage
export const uploadPdf = async (file: File, pdfId: string) => {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(`pdfs/${pdfId}`, file, {
      cacheControl: '3600',
      upsert: true,
    });
  if (error) throw new Error(`Failed to upload PDF: ${error.message}`);
  return data;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Failed to get user: ${error.message}`);
  return user;
};
