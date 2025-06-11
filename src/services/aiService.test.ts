import { AIService } from './aiService';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AIFeature } from '../types/aiTypes';
import { afterEach, describe, it } from 'node:test';

describe('AIService', () => {
  let aiService: AIService;
  let mock: MockAdapter;

  beforeEach(() => {
    aiService = new AIService();
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('handles malformed JSON response', async () => {
    mock
      .onPost('https://api.groq.com/v1/quiz/generate')
      .reply(200, '{ invalid: "}', { 'content-type': 'application/json' });
    mock
      .onPost('https://api.openai.com/v1/quiz/generate')
      .reply(200, '{ invalid: "}', { 'content-type': 'application/json' });

    const response = await aiService.callAI(AIFeature.QuizGeneration, { topic: 'test' });
    expect(response.success).toBe(true);
    expect(response.data).toEqual({
      questions: [{ id: 1, text: 'Sample question', options: ['A', 'B', 'C', 'D'] }],
    });
  });

  it('handles non-JSON response', async () => {
    mock
      .onPost('https://api.groq.com/v1/quiz/generate')
      .reply(500, '<html>Error</html>', { 'content-type': 'text/html' });
    mock
      .onPost('https://api.openai.com/v1/quiz/generate')
      .reply(500, '<html>Error</html>', { 'content-type': 'text/html' });

    const response = await aiService.callAI(AIFeature.QuizGeneration, { topic: 'test' });
    expect(response.success).toBe(true);
    expect(response.data).toEqual({
      questions: [{ id: 1, text: 'Sample question', options: ['A', 'B', 'C', 'D'] }],
    });
  });
});
function beforeEach(arg0: () => void) {
  throw new Error('Function not implemented.');
}

function expect(success: boolean) {
  throw new Error('Function not implemented.');
}

