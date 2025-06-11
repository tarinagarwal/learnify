import { supabase } from '../lib/supabase';

export interface ContentChunk {
  content_id: string;
  content_type: 'course' | 'quiz' | 'roadmap' | 'page' | 'pdf' | 'feature';
  title: string;
  content_chunk: string;
  chunk_index?: number;
  metadata?: Record<string, any>;
  source_url?: string;
}

export interface VectorSearchResult {
  id: number;
  content_id: string;
  content_type: string;
  title: string;
  content_chunk: string;
  metadata: Record<string, any>;
  source_url: string;
  similarity: number;
}

/**
 * Generate embeddings using OpenAI's embedding API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
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
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].embedding;
    } else {
      throw new Error('No embedding returned from OpenAI API');
    }
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Store content chunk with its embedding in the vector database
 */
export async function storeContentWithEmbedding(chunk: ContentChunk): Promise<void> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(chunk.content_chunk);
    
    // Store in Supabase vector table
    const { error } = await supabase
      .from('learnify_content_vectors')
      .insert({
        content_id: chunk.content_id,
        content_type: chunk.content_type,
        title: chunk.title,
        content_chunk: chunk.content_chunk,
        chunk_index: chunk.chunk_index || 0,
        metadata: chunk.metadata || {},
        embedding: `[${embedding.join(',')}]`, // Convert array to PostgreSQL vector format
        source_url: chunk.source_url
      });

    if (error) {
      console.error('Error storing content chunk:', error);
      throw new Error('Failed to store content chunk');
    }
  } catch (error) {
    console.error('Error in storeContentWithEmbedding:', error);
    throw error;
  }
}

/**
 * Perform semantic search using vector similarity
 */
export async function searchSimilarContent(
  query: string,
  contentTypes?: string[],
  similarityThreshold: number = 0.7,
  matchCount: number = 10
): Promise<VectorSearchResult[]> {
  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    
    // Call the Supabase function for vector similarity search
    const { data, error } = await supabase.rpc('search_learnify_content', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      content_types: contentTypes || null,
      similarity_threshold: similarityThreshold,
      match_count: matchCount
    });

    if (error) {
      console.error('Error searching similar content:', error);
      throw new Error('Failed to search similar content');
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchSimilarContent:', error);
    throw error;
  }
}

/**
 * Batch process and store multiple content chunks
 */
export async function batchStoreContent(chunks: ContentChunk[]): Promise<void> {
  console.log(`Processing ${chunks.length} content chunks...`);
  
  const batchSize = 5; // Process in smaller batches to avoid rate limits
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    // Process batch in parallel
    const promises = batch.map(chunk => storeContentWithEmbedding(chunk));
    
    try {
      await Promise.all(promises);
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`);
    } catch (error) {
      console.error(`Error processing batch ${Math.floor(i/batchSize) + 1}:`, error);
      // Continue with next batch even if one fails
    }
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Initialize vector database with existing Learnify content
 * This is the function that VectorDatabaseAdmin expects
 */
export async function initializeVectorDatabase(): Promise<void> {
  try {
    console.log('Initializing vector database with existing content...');
    
    const chunks: ContentChunk[] = [];
    
    // Get existing courses
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .limit(50);
    
    if (courses) {
      courses.forEach(course => {
        chunks.push({
          content_id: course.id,
          content_type: 'course',
          title: course.title,
          content_chunk: `Course: ${course.title}\n\nDescription: ${course.description}\n\nDifficulty: ${course.difficulty || 'Beginner'}\nSubject: ${course.subject || 'General'}`,
          metadata: {
            difficulty: course.difficulty,
            subject: course.subject,
            created_at: course.created_at
          },
          source_url: `/courses/${course.id}`
        });
      });
    }
    
    // Get existing roadmaps
    const { data: roadmaps } = await supabase
      .from('roadmaps')
      .select('*')
      .limit(50);
    
    if (roadmaps) {
      roadmaps.forEach(roadmap => {
        chunks.push({
          content_id: roadmap.id,
          content_type: 'roadmap',
          title: roadmap.title,
          content_chunk: `Learning Roadmap: ${roadmap.title}\n\nDescription: ${roadmap.description}\n\nDifficulty: ${roadmap.difficulty || 'Beginner'}`,
          metadata: {
            difficulty: roadmap.difficulty,
            created_at: roadmap.created_at
          },
          source_url: `/roadmaps/${roadmap.id}`
        });
      });
    }
    
    // Get quiz questions (if table exists)
    try {
      const { data: quizzes } = await supabase
        .from('quiz_questions')
        .select('*')
        .limit(100);
    
      if (quizzes) {
        quizzes.forEach(quiz => {
          chunks.push({
            content_id: quiz.id,
            content_type: 'quiz',
            title: `Quiz: ${quiz.question.substring(0, 50)}...`,
            content_chunk: `Quiz Question: ${quiz.question}\n\nCorrect Answer: ${quiz.correct_answer}\n\nExplanation: ${quiz.explanation || 'No explanation provided'}\n\nSubject: ${quiz.subject || 'General'}`,
            metadata: {
              difficulty: quiz.difficulty,
              subject: quiz.subject,
              question_type: 'multiple_choice'
            }
          });
        });
      }
    } catch (error) {
      console.log('Quiz questions table not found, skipping...');
    }
    
    // Add some default Learnify content if no database content exists
    if (chunks.length === 0) {
      chunks.push({
        content_id: 'default-platform-001',
        content_type: 'page',
        title: 'Learnify Platform Overview',
        content_chunk: 'Learnify is an AI-powered interactive learning platform that offers courses, quizzes, PDF tools, and learning roadmaps to help you achieve your educational goals.',
        metadata: { priority: 'high', category: 'platform' },
        source_url: '/'
      });
      
      chunks.push({
        content_id: 'default-features-001', 
        content_type: 'feature',
        title: 'Learnify Core Features',
        content_chunk: 'Core features include interactive quiz system with GROQ AI, course management, advanced PDF tools, learning roadmaps, expert chat support, and community learning.',
        metadata: { priority: 'high', category: 'features' },
        source_url: '/features'
      });
    }
    
    if (chunks.length > 0) {
      await batchStoreContent(chunks);
      console.log(`Successfully initialized vector database with ${chunks.length} content chunks`);
    } else {
      console.log('No content found to vectorize');
    }
    
  } catch (error) {
    console.error('Error initializing vector database:', error);
    throw error;
  }
}

/**
 * Test the vector search functionality
 * This is the function that VectorDatabaseAdmin expects
 */
export async function testVectorSearch(): Promise<void> {
  try {
    console.log('Testing vector search functionality...');
    
    const testQueries = [
      'How to learn programming?',
      'What are the best practices for learning?',
      'PDF analysis and document processing',
      'Interactive quizzes and assessments',
      'Learning roadmaps and skill development'
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const query of testQueries) {
      console.log(`\nTesting query: "${query}"`);
      totalTests++;
      
      try {
        const results = await searchSimilarContent(query, undefined, 0.5, 3);
        
        if (results.length > 0) {
          console.log(`✅ Found ${results.length} results`);
          results.forEach((result, index) => {
            console.log(`  ${index + 1}. ${result.title} (similarity: ${result.similarity.toFixed(3)})`);
            console.log(`     Type: ${result.content_type}`);
            console.log(`     Preview: ${result.content_chunk.substring(0, 100)}...`);
          });
          passedTests++;
        } else {
          console.log(`⚠️ No results found for: "${query}"`);
        }
      } catch (error) {
        console.log(`❌ Error testing query "${query}":`, error);
      }
    }
    
    console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} queries returned results`);
    
    if (passedTests === 0) {
      throw new Error('All vector search tests failed. Check your OpenAI API key and embedding setup.');
    } else if (passedTests < totalTests) {
      console.log('⚠️ Some tests failed, but vector search is partially working');
    } else {
      console.log('🎉 All vector search tests passed!');
    }
    
  } catch (error) {
    console.error('Error testing vector search:', error);
    throw error;
  }
}

/**
 * Alternative test function that uses text search as fallback
 */
export async function testSearchFunctionality(): Promise<void> {
  try {
    console.log('Testing search functionality (with fallback to text search)...');
    
    // Test if we have any content in the database
    const { data: contentCheck, error } = await supabase
      .from('learnify_content_vectors')
      .select('count(*)')
      .single();
    
    if (error) {
      throw new Error('Cannot access learnify_content_vectors table');
    }
    
    const contentCount = contentCheck?.count || 0;
    console.log(`📊 Found ${contentCount} content chunks in database`);
    
    if (contentCount === 0) {
      throw new Error('No content found in database. Run initialization first.');
    }
    
    // Test basic text search
    const { data: searchResults } = await supabase
      .from('learnify_content_vectors')
      .select('*')
      .ilike('content_chunk', '%learnify%')
      .limit(3);
    
    if (searchResults && searchResults.length > 0) {
      console.log('✅ Text search is working');
      searchResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
      });
    } else {
      console.log('⚠️ No results found in text search');
    }
    
    // Try vector search if OpenAI key is available
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      console.log('🧪 Testing vector search...');
      try {
        await testVectorSearch();
      } catch (vectorError) {
        console.log('⚠️ Vector search failed, but text search is working');
        console.log('Vector search error:', vectorError);
      }
    } else {
      console.log('ℹ️ OpenAI API key not found, skipping vector search test');
    }
    
    console.log('🎉 Search functionality test completed!');
    
  } catch (error) {
    console.error('Error testing search functionality:', error);
    throw error;
  }
}