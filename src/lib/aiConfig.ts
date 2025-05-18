import { AIConfig } from '../types/aiTypes';

export const aiConfig: AIConfig = {
  primary: {
    provider: 'groq',
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    endpoint: 'https://api.groq.com/v1',
  },
  fallback: {
    provider: 'openai',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1',
  },
};
