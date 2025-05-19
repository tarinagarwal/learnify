import { AIResponse, AIFeature } from '../types/aiTypes';

export const mockAI = {
  async call(feature: AIFeature, payload: any): Promise<AIResponse> {
    const mockResponses = {
      [AIFeature.QuizGeneration]: {
        success: true,
        data: { questions: [{ id: 1, text: 'Sample question', options: ['A', 'B', 'C', 'D'] }] },
      },
      [AIFeature.PDFChat]: {
        success: true,
        data: { response: 'Sample PDF chat response' },
      },
      [AIFeature.LanguageTutor]: {
        success: true,
        data: { response: 'Sample language tutor response' },
      },
    };

    return mockResponses[feature] || { success: false, error: 'Feature not supported' };
  },
};
