import { supabase } from './supabase';
import { Annotation } from '../types';

export const createAnnotation = async (annotation: Omit<Annotation, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('annotations')
    .insert([annotation])
    .select()
    .single();
  if (error) throw new Error(`Failed to create annotation: ${error.message}`);
  return data as Annotation;
};

export const getAnnotations = async (pdfId: string, userId: string) => {
  const { data, error } = await supabase
    .from('annotations')
    .select('*')
    .eq('pdf_id', pdfId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`Failed to fetch annotations: ${error.message}`);
  return data as Annotation[];
};

export const updateAnnotation = async (id: string, updates: Partial<Annotation>) => {
  const { data, error } = await supabase
    .from('annotations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update annotation: ${error.message}`);
  return data as Annotation;
};

export const deleteAnnotation = async (id: string) => {
  const { error } = await supabase
    .from('annotations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`Failed to delete annotation: ${error.message}`);
};
