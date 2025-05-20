import { AIResponse, AIFeature, AIPayload, QuizGenerationResponse, PDFChatResponse, LanguageTutorResponse } from '../types/aiTypes';

     export const mockAI = {
       async call(payload: AIPayload): Promise<AIResponse> {
         const { feature, data } = payload;

         switch (feature) {
           case AIFeature.QuizGeneration: {
             const { topic, numQuestions = 1, difficulty = 'medium' } = data as AIPayload['data'] & { topic: string };
             const questions = Array.from({ length: numQuestions }, (_, i) => ({
               id: i + 1,
               text: `Sample question about ${topic} (${difficulty})`,
               options: ['Option A', 'Option B', 'Option C', 'Option D'],
             }));
             return { success: true, data: { questions } as QuizGenerationResponse };
           }
           case AIFeature.PDFChat: {
             const { query } = data as AIPayload['data'] & { query: string };
             return {
               success: true,
               data: { response: `Mock response to query: ${query}` } as PDFChatResponse,
             };
           }
           case AIFeature.LanguageTutor: {
             const { prompt, language, level = 'beginner' } = data as AIPayload['data'] & { prompt: string; language: string };
             return {
               success: true,
               data: {
                 response: `Mock ${language} tutor response for ${level} level: ${prompt}`,
                 corrections: prompt ? [{ original: prompt, corrected: `Corrected: ${prompt}` }] : [],
               } as LanguageTutorResponse,
             };
           }
           default:
             return { success: false, error: 'Feature not supported' };
         }
       },
     };
