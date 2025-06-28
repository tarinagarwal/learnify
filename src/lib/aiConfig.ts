import { AIConfig } from '../types/aiTypes';

export const aiConfig: AIConfig = {
  primary: {
    provider: 'groq',
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    endpoint: 'https://api.groq.com/v1',
  },
  secondary: {
    provider: 'openai',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1',
  },
  tertiary: {
    provider: 'gemini',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    endpoint: 'https://api.gemini.com/v1',
  },
  quaternary: {
    provider: 'anthropic',
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    endpoint: 'https://api.anthropic.com/v1',
  },
  fallback: {
    provider: 'deepseek',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
    endpoint: 'https://api.deepseek.com/v1',
  },
  yourchoice: {
    provider: 'yourchoice',
    apiKey: import.meta.env.YOUR_CHOICE_API_KEY, // Replace with your choice of provider
    endpoint: 'https://api.yourchoice.com/v1', // Replace with your choice
  }
  // Add more providers as needed
  // Ensure that the API keys are set in your environment variables
  // VITE_GROQ_API_KEY, VITE_OPENAI_API_KEY, VITE_GEMINI_API_KEY,
  // VITE_ANTHROPIC_API_KEY, VITE_DEEPSEEK_API_KEY
  // You can also add more providers like 'mistral', 'cohere', etc
  // as needed in the future.
};
