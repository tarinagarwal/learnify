export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AIConfig {
  primary: {
    provider: string;
    apiKey: string;
    endpoint: string;
  };
  secondary: {
    provider: string;
    apiKey: string;
    endpoint: string;
  };
  tertiary: {
    provider: string;
    apiKey: string;
    endpoint: string;
  };
  quaternary: {
    provider: string;
    apiKey: string;
    endpoint: string;
  };
  fallback: {
    provider: string;
    apiKey: string;
    endpoint: string;
  };
  yourchoice: {
    provider: string;
    apiKey: string;
    endpoint: string;
  };
}

export enum AIFeature {
  QuizGeneration = 'quizGeneration',
  PDFChat = 'pdfChat',
  LanguageTutor = 'languageTutor',
}
