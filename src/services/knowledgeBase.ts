import { supabase } from '../lib/supabase';
import { generateGroqResponse, MODELS } from './groq';

export interface KnowledgeItem {
  id: string;
  content: string;
  type: string;
  title: string;
  similarity?: number;
  searchMethod?: 'text' | 'vector' | 'hybrid';
}

export interface AIResponse {
  content: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  searchMethod: 'text' | 'vector' | 'hybrid';
  tokenUsage?: number;
}

export interface ConversationContext {
  role: string;
  content: string;
}

// Token budget management
let dailyTokenUsage = 0;
const DAILY_TOKEN_LIMIT = 1000; // Adjust based on your OpenAI plan
const TOKEN_RESET_HOUR = 0; // Reset at midnight

/**
 * Determine if we should use vector search based on query complexity and token budget
 */
function shouldUseVectorSearch(query: string): boolean {
  // Check token budget first
  if (dailyTokenUsage >= DAILY_TOKEN_LIMIT) {
    console.log('Token limit reached, using text search only');
    return false;
  }

  // Query complexity analysis
  const complexityIndicators = [
    /explain|how does|what is the difference|compare|analyze|detailed|comprehensive/i,
    /relationship|connection|similar|related|analogy/i,
    /best practice|strategy|approach|methodology/i,
    /troubleshoot|debug|solve|problem|issue/i,
    /recommend|suggest|advise|guide/i
  ];

  const isComplex = complexityIndicators.some(pattern => pattern.test(query));
  const isLongQuery = query.split(' ').length > 5;
  const hasMultipleConcepts = query.split(' ').length > 8;

  // Use vector search for complex, detailed, or multi-concept queries
  return isComplex || isLongQuery || hasMultipleConcepts;
}

/**
 * Generate embedding with token tracking (when vector search is used)
 */
async function generateEmbeddingWithTracking(text: string): Promise<number[] | null> {
  try {
    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(text.length / 4);
    
    if (dailyTokenUsage + estimatedTokens > DAILY_TOKEN_LIMIT) {
      console.log('Would exceed token limit, skipping vector search');
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text.replace(/\n/g, ' ').trim(),
        encoding_format: 'float'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Track actual token usage
    const actualTokens = data.usage?.total_tokens || estimatedTokens;
    dailyTokenUsage += actualTokens;
    
    console.log(`Vector search used ${actualTokens} tokens. Daily total: ${dailyTokenUsage}/${DAILY_TOKEN_LIMIT}`);
    
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error('Vector embedding failed:', error);
    return null;
  }
}

/**
 * Vector similarity search (when budget allows)
 */
async function vectorSearch(query: string, matchCount: number = 5): Promise<KnowledgeItem[]> {
  try {
    const embedding = await generateEmbeddingWithTracking(query);
    if (!embedding) return [];

    const { data, error } = await supabase.rpc('search_learnify_content', {
      query_embedding: `[${embedding.join(',')}]`,
      content_types: null,
      similarity_threshold: 0.6,
      match_count: matchCount
    });

    if (error) throw error;

    return (data || []).map((item: unknown) => ({
      id: item.content_id as string,
      content: item.content_chunk as string,
      type: item.content_type as string,
      title: item.title as string,
      similarity: item.similarity as number,
      searchMethod: 'vector' as const
    }));
  } catch (error: unknown) {
    console.error('Vector search failed:', error);
    return [];
  }
}

// Corrected textSearch function
async function textSearch(query: string, matchCount: number = 8): Promise<KnowledgeItem[]> {
  try {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    const { data, error } = await supabase
      .from('learnify_content_vectors')
      .select('*')
      .or(
        searchTerms.map(term => 
          `title.ilike.%${term}%,content_chunk.ilike.%${term}%`
        ).join(',')
      )
      .limit(matchCount);

    if (error) throw error;

    return (data || []).map((item: unknown) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const contentLower = item.content_chunk.toLowerCase();
      const queryLower = query.toLowerCase();

      // Exact phrase match (highest score)
      if (titleLower.includes(queryLower) || contentLower.includes(queryLower)) {
        score += 1.0;
      }

      // Title keyword matches (high score)
      searchTerms.forEach(term => {
        if (titleLower.includes(term)) score += 0.3;
        if (contentLower.includes(term)) score += 0.1;
      });

      // Content type relevance
      const typeRelevance: Record<string, number> = {
        'page': 0.9,
        'feature': 0.8,
        'guide': 0.7,
        'course': 0.6,
        'quiz': 0.5
      };
      score += (typeRelevance[item.content_type] || 0.4);

      // Metadata keyword matches
      if (item.metadata?.keywords) {
        const keywords = Array.isArray(item.metadata.keywords) ? item.metadata.keywords : [];
        searchTerms.forEach(term => {
          if (keywords.some((keyword: string) => keyword.toLowerCase().includes(term))) {
            score += 0.2;
          }
        });
      }

      return {
        id: item.content_id as string,
        content: item.content_chunk as string,
        type: item.content_type as string,
        title: item.title as string,
        similarity: Math.min(score, 1.0),
        searchMethod: 'text' as const
      };
    }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  } catch (error: unknown) {
    console.error('Text search failed:', error);
    return [];
  }
}

// Improved token reset function
function resetTokensIfNeeded() {
  const today = new Date().toDateString();
  const lastReset = localStorage.getItem('learnify_token_reset_date');
  
  if (lastReset !== today) {
    dailyTokenUsage = 0;
    localStorage.setItem('learnify_token_reset_date', today);
    console.log('🔄 Daily token usage reset');
  }
}

/**
 * Hybrid search: Intelligently combines vector and text search
 */
export async function searchKnowledgeBase(query: string): Promise<KnowledgeItem[]> {
    resetTokensIfNeeded();
  console.log(`🔍 Hybrid search for: "${query}"`);
  
  const useVector = shouldUseVectorSearch(query);
  let searchMethod: 'text' | 'vector' | 'hybrid' = 'text';
  let knowledgeItems: KnowledgeItem[] = [];

  if (useVector) {
    console.log('📡 Using vector search for complex query');
    
    // Try vector search first
    const vectorResults = await vectorSearch(query, 5);
    
    if (vectorResults.length > 0) {
      searchMethod = 'vector';
      knowledgeItems = vectorResults;
      
      // Supplement with text search for comprehensive results
      const textResults = await textSearch(query, 3);
      const combinedResults = [...vectorResults];
      
      // Add unique text results
      textResults.forEach(textItem => {
        if (!vectorResults.find(vItem => vItem.id === textItem.id)) {
          combinedResults.push({...textItem, searchMethod: 'hybrid'});
        }
      });
      
      knowledgeItems = combinedResults.slice(0, 8);
      searchMethod = 'hybrid';
    } else {
      console.log('⚠️ Vector search failed, falling back to text search');
      knowledgeItems = await textSearch(query, 8);
      searchMethod = 'text';
    }
  } else {
    console.log('📝 Using text search for simple query or token conservation');
    knowledgeItems = await textSearch(query, 8);
    searchMethod = 'text';
  }

  // Add search method to items
  knowledgeItems.forEach(item => {
    if (!item.searchMethod) item.searchMethod = searchMethod;
  });

  console.log(`✅ Found ${knowledgeItems.length} items using ${searchMethod} search`);
  return knowledgeItems;
}

/**
 * Create context-aware prompt with conversation history
 */
function createContextualPrompt(
  userQuery: string, 
  knowledgeItems: KnowledgeItem[], 
  conversationHistory: ConversationContext[] = [],
  searchMethod: string
): string {
  // Prepare context from knowledge base
  const contextSections = knowledgeItems.map((item, index) => {
    const methodBadge = item.searchMethod === 'vector' ? '🎯' : '📝';
    const similarityText = item.similarity ? ` (${(item.similarity * 100).toFixed(1)}%)` : '';
    return `[${methodBadge} Source ${index + 1}: ${item.title}${similarityText}]\n${item.content}`;
  });
  
  const context = contextSections.length > 0 
    ? contextSections.join('\n\n---\n\n')
    : 'No specific content found in knowledge base.';

  // Prepare conversation context
  let conversationContext = '';
  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6); // Keep last 6 messages for context
    conversationContext = '\n\nCONVERSATION HISTORY:\n' + 
      recentHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n') + 
      '\n\n';
  }

  // Enhanced system prompt with conversation awareness
  return `You are an advanced AI learning assistant for Learnify, powered by a hybrid knowledge base system that combines semantic vector search with intelligent text matching.

PLATFORM OVERVIEW:
Learnify is a comprehensive AI-powered learning platform featuring:
• Interactive Quiz System with GROQ AI for contextual question generation
• Course Management with progress tracking and multimedia content
• Advanced PDF Tools for document analysis and interactive learning
• Learning Roadmaps with structured skill development paths
• Expert Chat for human mentorship and personalized guidance
• Community Learning with collaborative features and peer interaction
• AI Analytics and personalized recommendations

RESPONSE GUIDELINES:
1. Provide helpful, encouraging, and educational responses
2. Use the provided context to give accurate, specific answers
3. Reference sources naturally when information is available
4. For limited context, provide general guidance about Learnify features
5. Maintain a supportive, professional learning tone
6. Include actionable next steps when possible
7. Format responses clearly with emphasis and structure
8. Consider conversation history for context-aware responses
9. Build upon previous discussions naturally

KNOWLEDGE BASE CONTEXT:
${context}

SEARCH METHOD: ${searchMethod.toUpperCase()}
${searchMethod === 'hybrid' ? '(Combined vector semantic search + intelligent text matching)' : 
  searchMethod === 'vector' ? '(Semantic vector search for deep understanding)' : 
  '(Intelligent text search for fast, accurate results)'}

${conversationContext}

Current Query: ${userQuery}

Based on this context, conversation history, and your knowledge of learning platforms, provide a comprehensive response to the user's question. If the context doesn't fully address their question, acknowledge this and provide helpful guidance while highlighting relevant Learnify features.`;
}

/**
 * NEW: Streaming AI response generation with conversation context
 */
export async function generateStreamingResponse(
  userQuery: string,
  conversationHistory: ConversationContext[] = [],
  onChunk: (chunk: string, sources?: string[], confidence?: 'high' | 'medium' | 'low') => void
): Promise<void> {
  try {
    console.log(`🧠 Generating streaming AI response for: "${userQuery}"`);
    
    const knowledgeItems = await searchKnowledgeBase(userQuery);
    
    // Determine overall search method used
    const searchMethods = knowledgeItems.map(item => item.searchMethod).filter(Boolean);
    const primaryMethod = searchMethods.includes('vector') ? 
      (searchMethods.includes('text') ? 'hybrid' : 'vector') : 'text';
    
    // Enhanced confidence scoring
    let confidence: 'high' | 'medium' | 'low' = 'low';
    
    if (knowledgeItems.length > 0) {
      const avgSimilarity = knowledgeItems.reduce((sum, item) => sum + (item.similarity || 0), 0) / knowledgeItems.length;
      const hasVectorResults = knowledgeItems.some(item => item.searchMethod === 'vector');
      const hasConversationContext = conversationHistory.length > 0;
      
      if (avgSimilarity > 0.8 || (hasVectorResults && avgSimilarity > 0.6) || hasConversationContext) {
        confidence = 'high';
      } else if (avgSimilarity > 0.5 || knowledgeItems.length >= 3) {
        confidence = 'medium';
      }
    }
    
    // Check for keyword responses
    const keywordResponse = getKeywordResponse(userQuery);
    if (keywordResponse && knowledgeItems.length === 0) {
      // Stream keyword response
      const words = keywordResponse.split(' ');
      const sources = ['Learnify Platform Guide'];
      
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        onChunk(chunk, i === words.length - 1 ? sources : undefined, i === words.length - 1 ? 'medium' : undefined);
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
      }
      return;
    }
    
    // Create contextual prompt
    const systemPrompt = createContextualPrompt(userQuery, knowledgeItems, conversationHistory, primaryMethod);
    
    // Stream response from Groq
    await streamGroqResponse(userQuery, systemPrompt, (chunk) => {
      onChunk(chunk);
    });
    
    // Send final metadata
    const sources = knowledgeItems.length > 0 
      ? knowledgeItems.map(item => item.title).slice(0, 5)
      : ['Learnify Platform Guide'];
      
    onChunk('', sources, confidence);

  } catch (error) {
    console.error('Error generating streaming AI response:', error);
    
    const fallbackMessage = `I'm here to help with your learning on Learnify! 🚀

**Learnify Features:**
• **Interactive Quizzes** - AI-generated questions to test knowledge
• **Courses** - Structured learning with progress tracking
• **PDF Tools** - Analyze documents and create study materials  
• **Learning Roadmaps** - Guided paths for skill development
• **Expert Chat** - Connect with human experts for guidance
• **Community** - Collaborative learning with peers

What would you like to explore?`;

    // Stream fallback response
    const words = fallbackMessage.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      onChunk(chunk, i === words.length - 1 ? ['Learnify Platform Guide'] : undefined, i === words.length - 1 ? 'medium' : undefined);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

/**
 * NEW: Stream response from Groq with better error handling
 */
async function streamGroqResponse(
  userQuery: string, 
  systemPrompt: string, 
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.LLAMA_70B_VERSATILE,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
              // Add small delay for better visual effect
              await new Promise(resolve => setTimeout(resolve, 30));
            }
          } catch (parseError) {
            // Ignore parsing errors for malformed chunks only console.log for dev purposes
            console.log(parseError)
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}

/**
 * Enhanced AI response generation with hybrid intelligence
 */
export async function generateAIResponse(userQuery: string, conversationHistory: ConversationContext[] = []): Promise<AIResponse> {
  try {
    console.log(`🧠 Generating AI response for: "${userQuery}"`);
    
    const knowledgeItems = await searchKnowledgeBase(userQuery);
    
    // Determine overall search method used
    const searchMethods = knowledgeItems.map(item => item.searchMethod).filter(Boolean);
    const primaryMethod = searchMethods.includes('vector') ? 
      (searchMethods.includes('text') ? 'hybrid' : 'vector') : 'text';
    
    // Enhanced confidence scoring
    let confidence: 'high' | 'medium' | 'low' = 'low';
    
    if (knowledgeItems.length > 0) {
      const avgSimilarity = knowledgeItems.reduce((sum, item) => sum + (item.similarity || 0), 0) / knowledgeItems.length;
      const hasVectorResults = knowledgeItems.some(item => item.searchMethod === 'vector');
      const hasConversationContext = conversationHistory.length > 0;
      
      if (avgSimilarity > 0.8 || (hasVectorResults && avgSimilarity > 0.6) || hasConversationContext) {
        confidence = 'high';
      } else if (avgSimilarity > 0.5 || knowledgeItems.length >= 3) {
        confidence = 'medium';
      }
    }
    
    // Check for keyword responses
    const keywordResponse = getKeywordResponse(userQuery);
    if (keywordResponse && knowledgeItems.length === 0) {
      return {
        content: keywordResponse,
        sources: ['Learnify Platform Guide'],
        confidence: 'medium',
        searchMethod: 'text'
      };
    }
    
    // Create contextual prompt
    const systemPrompt = createContextualPrompt(userQuery, knowledgeItems, conversationHistory, primaryMethod);
    const aiResponse = await generateGroqResponse(userQuery, systemPrompt);
    
    const sources = knowledgeItems.length > 0 
      ? knowledgeItems.map(item => item.title).slice(0, 5)
      : ['Learnify Platform Guide'];

    return {
      content: aiResponse,
      sources,
      confidence,
      searchMethod: primaryMethod,
      tokenUsage: dailyTokenUsage
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    return {
      content: `I'm here to help with your learning on Learnify! 🚀

**Learnify Features:**
• **Interactive Quizzes** - AI-generated questions to test knowledge
• **Courses** - Structured learning with progress tracking
• **PDF Tools** - Analyze documents and create study materials  
• **Learning Roadmaps** - Guided paths for skill development
• **Expert Chat** - Connect with human experts for guidance
• **Community** - Collaborative learning with peers

What would you like to explore?`,
      sources: ['Learnify Platform Guide'],
      confidence: 'medium',
      searchMethod: 'text'
    };
  }
}

/**
 * Enhanced keyword responses for common queries
 */
export function getKeywordResponse(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  if (/(what is learnify|about learnify|learnify platform)/i.test(lowerQuery)) {
    return `**Learnify** is an advanced AI-powered learning platform that revolutionizes education through intelligent technology! 🚀

**🎯 Core Features:**
• **Smart Quiz System** - Generate custom quizzes using GROQ AI from any topic or PDF
• **Course Management** - Structured learning paths with progress tracking and analytics
• **PDF Intelligence** - Interactive document analysis, chat, and study material generation
• **Learning Roadmaps** - Guided skill development from beginner to expert levels
• **Expert Support** - Direct access to human mentors for personalized guidance
• **Community Learning** - Collaborative features with peer interaction and knowledge sharing

**🧠 AI-Powered Intelligence:**
✨ Adaptive learning algorithms that personalize your experience
📊 Comprehensive analytics to track progress and identify improvement areas
🎚️ Dynamic difficulty adjustment based on performance
💡 Intelligent recommendations for optimal learning paths

**🔧 Advanced Tools:**
• Interactive whiteboards for visual learning
• Code playgrounds for programming practice
• Speech synthesis for audio learning
• Multi-language support and translation
• Gamification with achievements and progress rewards

Ready to transform your learning journey? What subject would you like to explore first?`;
  }
  
  if (/(hello|hi|hey)/i.test(lowerQuery)) {
    return `Hello! 👋 Welcome to Learnify's AI Learning Assistant!

I'm powered by a hybrid knowledge base system that combines:
🎯 **Vector Search** - For deep semantic understanding
📝 **Text Search** - For fast, accurate results
🔀 **Smart Routing** - Choosing the best method for your query

**I can help you with:**
• Platform features and capabilities
• Learning strategies and study tips
• Course and quiz recommendations
• PDF analysis and document processing
• Technical support and guidance

What would you like to learn about today?`;
  }
  
  return null;
}

// Reset token usage daily
setInterval(() => {
  const now = new Date();
  if (now.getHours() === TOKEN_RESET_HOUR && now.getMinutes() === 0) {
    dailyTokenUsage = 0;
    console.log('🔄 Daily token usage reset');
  }
}, 60000); // Check every minute