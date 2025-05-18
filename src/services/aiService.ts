import { CircuitBreaker } from './circuitBreaker';
import { aiConfig } from '../lib/aiConfig';
import { logger } from '../utils/logger';
import { mockAI } from './mockAI';
import { AIResponse, AIFeature } from '../types/aiTypes';
import axios from 'axios';

export class AIService {
  private primaryBreaker: CircuitBreaker;
  private fallbackBreaker: CircuitBreaker;
  private maxRetries: number;

  constructor() {
    this.primaryBreaker = new CircuitBreaker(
      Number(import.meta.env.VITE_AI_CIRCUIT_BREAKER_THRESHOLD) || 5,
      Number(import.meta.env.VITE_AI_CIRCUIT_BREAKER_TIMEOUT) || 60000
    );
    this.fallbackBreaker = new CircuitBreaker(
      Number(import.meta.env.VITE_AI_CIRCUIT_BREAKER_THRESHOLD) || 5,
      Number(import.meta.env.VITE_AI_CIRCUIT_BREAKER_TIMEOUT) || 60000
    );
    this.maxRetries = Number(import.meta.env.VITE_AI_RETRY_ATTEMPTS) || 3;
  }

  async callAI(feature: AIFeature, payload: any): Promise<AIResponse> {
    const startTime = Date.now();
    try {
      // Try primary AI service
      const response = await this.primaryBreaker.execute(() =>
        this.retryOperation(() => this.makeAICall(aiConfig.primary, feature, payload))
      );
      logger.info(`AI call succeeded for ${feature} with ${aiConfig.primary.provider}`, {
        duration: Date.now() - startTime,
      });
      return response;
    } catch (error) {
      logger.error(`Primary AI call failed for ${feature}`, { error });
      try {
        // Try fallback AI service
        const response = await this.fallbackBreaker.execute(() =>
          this.retryOperation(() => this.makeAICall(aiConfig.fallback, feature, payload))
        );
        logger.info(`AI call succeeded for ${feature} with ${aiConfig.fallback.provider}`, {
          duration: Date.now() - startTime,
        });
        return response;
      } catch (fallbackError) {
        logger.error(`Fallback AI call failed for ${feature}`, { fallbackError });
        // Use mock AI for graceful degradation
        const mockResponse = await mockAI.call(feature, payload);
        logger.info(`Using mock AI for ${feature}`, { duration: Date.now() - startTime });
        return mockResponse;
      }
    }
  }

  private async retryOperation(operation: () => Promise<AIResponse>): Promise<AIResponse> {
    let lastError: any;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  private async makeAICall(config: AIConfig['primary' | 'fallback'], feature: AIFeature, payload: any): Promise<AIResponse> {
    const endpointMap = {
      [AIFeature.QuizGeneration]: '/quiz/generate',
      [AIFeature.PDFChat]: '/chat/pdf',
      [AIFeature.LanguageTutor]: '/tutor/language',
    };

    try {
      const response = await axios.post(
        `${config.endpoint}${endpointMap[feature]}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const aiService = new AIService();
