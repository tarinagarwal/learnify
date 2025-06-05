import { CircuitBreaker } from './circuitBreaker';
     import { aiConfig } from '../lib/aiConfig';
     import { logger } from '../utils/logger';
     import { mockAI } from './mockAI';
     import { AIResponse, AIFeature, AIPayload } from '../types/aiTypes';
     import axios, { AxiosError } from 'axios';
     import { monitoringService } from './monitoringService';

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

       async callAI(payload: AIPayload, p0: { topic: string; }): Promise<AIResponse> {
         const { feature, data } = payload;
         const startTime = Date.now();
         try {
           const response = await this.primaryBreaker.execute(() =>
             this.retryOperation(() => this.makeAICall(aiConfig.primary, feature, data))
           );
           await monitoringService.logMetric({
             feature,
             provider: aiConfig.primary.provider,
             duration: Date.now() - startTime,
             success: true,
           });
           return response;
         } catch (error) {
           const errorMessage = error instanceof Error ? error.message : 'Unknown error';
           await monitoringService.logMetric({
             feature,
             provider: aiConfig.primary.provider,
             duration: Date.now() - startTime,
             success: false,
             error: errorMessage,
           });
           logger.error(`Primary AI call failed for ${feature}`, { error });
           try {
             const response = await this.fallbackBreaker.execute(() =>
               this.retryOperation(() => this.makeAICall(aiConfig.fallback, feature, data))
             );
             await monitoringService.logMetric({
               feature,
               provider: aiConfig.fallback.provider,
               duration: Date.now() - startTime,
               success: true,
             });
             return response;
           } catch (fallbackError) {
             const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
             await monitoringService.logMetric({
               feature,
               provider: aiConfig.fallback.provider,
               duration: Date.now() - startTime,
               success: false,
               error: fallbackErrorMessage,
             });
             logger.error(`Fallback AI call failed for ${feature}`, { fallbackError });
             const mockResponse = await mockAI.call(payload);
             await monitoringService.logMetric({
               feature,
               provider: 'mock',
               duration: Date.now() - startTime,
               success: true,
             });
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
               const delay = Math.pow(2, attempt) * 1000;
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

           if (!response.data || typeof response.data !== 'object') {
             throw new Error('Invalid response format: Expected JSON object');
           }

           return { success: true, data: response.data };
         } catch (error) {
           let errorMessage = 'Unknown error';
           if (error instanceof AxiosError) {
             if (error.response) {
               const contentType = error.response.headers['content-type'] || '';
               if (!contentType.includes('application/json')) {
                 errorMessage = 'Invalid response: Non-JSON content received';
               } else {
                 errorMessage = error.response.data?.error || error.message;
               }
             } else {
               errorMessage = error.message;
             }
           } else if (error instanceof SyntaxError) {
             errorMessage = 'Malformed JSON response';
           }

           logger.error(`AI call failed for ${feature} with ${config.provider}`, {
             error: errorMessage,
             payload,
           });
           return { success: false, error: errorMessage };
         }
       }
     }

     export const aiService = new AIService();
