-- Migration: Create Vector Database for AI Knowledge Base
-- Date: 2025-06-04
-- Purpose: Add vector storage and semantic search capabilities for AI chatbot

-- Enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the vector storage table for Learnify content
CREATE TABLE IF NOT EXISTS learnify_content_vectors (
  id BIGSERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- 'course', 'quiz', 'roadmap', 'page', 'pdf', 'feature'
  title VARCHAR(500) NOT NULL,
  content_chunk TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI ada-002 creates 1536-dimensional vectors
  source_url VARCHAR(1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient vector similarity search
CREATE INDEX IF NOT EXISTS learnify_content_vectors_embedding_idx 
ON learnify_content_vectors 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create indexes for metadata filtering
CREATE INDEX IF NOT EXISTS learnify_content_vectors_content_type_idx 
ON learnify_content_vectors (content_type);

CREATE INDEX IF NOT EXISTS learnify_content_vectors_content_id_idx 
ON learnify_content_vectors (content_id);

-- Create index for text search as fallback
CREATE INDEX IF NOT EXISTS learnify_content_vectors_content_gin_idx 
ON learnify_content_vectors 
USING gin(to_tsvector('english', content_chunk));

-- Create index for created_at for time-based queries
CREATE INDEX IF NOT EXISTS learnify_content_vectors_created_at_idx 
ON learnify_content_vectors (created_at DESC);

-- Function for similarity search with content type filtering
CREATE OR REPLACE FUNCTION search_learnify_content(
  query_embedding VECTOR(1536),
  content_types TEXT[] DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  content_id VARCHAR(255),
  content_type VARCHAR(50),
  title VARCHAR(500),
  content_chunk TEXT,
  metadata JSONB,
  source_url VARCHAR(1000),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lcv.id,
    lcv.content_id,
    lcv.content_type,
    lcv.title,
    lcv.content_chunk,
    lcv.metadata,
    lcv.source_url,
    (1 - (lcv.embedding <=> query_embedding)) AS similarity
  FROM learnify_content_vectors lcv
  WHERE 
    (content_types IS NULL OR lcv.content_type = ANY(content_types))
    AND (1 - (lcv.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY lcv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_learnify_content_vectors_updated_at 
BEFORE UPDATE ON learnify_content_vectors 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert comprehensive Learnify platform content
INSERT INTO learnify_content_vectors (content_id, content_type, title, content_chunk, metadata, source_url) VALUES 

-- Core Platform Information
('learnify-platform-001', 'page', 'What is Learnify', 'Learnify is an AI-powered interactive learning platform that transforms education through intelligent content generation, personalized learning paths, and comprehensive analytics. The platform combines cutting-edge AI technology with proven educational methodologies to create an engaging and effective learning environment.', '{"priority": "high", "category": "platform", "keywords": ["learnify", "platform", "AI", "education"]}', '/'),

('learnify-mission-001', 'page', 'Learnify Mission and Vision', 'Learnify mission is to democratize quality education by making personalized, AI-driven learning accessible to everyone. We envision a future where every learner can achieve their full potential through adaptive, intelligent educational experiences tailored to their unique needs and learning style.', '{"priority": "high", "category": "platform", "keywords": ["mission", "vision", "education", "accessibility"]}', '/about'),

-- Feature Documentation
('quiz-system-001', 'feature', 'Interactive Quiz System', 'Learnify quiz system uses GROQ AI to generate contextual questions based on topics or PDF content. Features include adjustable difficulty levels (Beginner, Intermediate, Advanced), detailed explanations for each answer, real-time performance analytics, and adaptive learning algorithms that adjust question complexity based on user performance. Users can create custom quizzes from any content instantly and track their progress over time.', '{"feature": "quiz", "priority": "high", "keywords": ["quiz", "GROQ", "AI", "questions", "difficulty", "analytics"]}', '/quiz'),

('course-management-001', 'feature', 'Course Management System', 'Comprehensive course system with structured learning content, progress tracking, skill-based organization, achievements, and certificates. Courses are organized by difficulty level and subject area with multimedia content, interactive elements, chapter-based structure, and speech synthesis for audio learning. The system supports both user-created and AI-generated courses with collaborative features.', '{"feature": "courses", "priority": "high", "keywords": ["courses", "learning", "progress", "certificates", "chapters"]}', '/courses'),

('pdf-tools-001', 'feature', 'Advanced PDF Tools', 'Interactive PDF analysis tools that allow document chat, quiz generation from content, smart annotations with highlight coordination, insight extraction, and comprehensive library management. The system can transform any PDF into an interactive learning resource with AI assistance, supporting features like text extraction, summarization, and contextual Q&A generation.', '{"feature": "pdf", "priority": "high", "keywords": ["PDF", "analysis", "chat", "annotations", "documents"]}', '/resources'),

('learning-roadmaps-001', 'feature', 'Learning Roadmaps', 'Structured learning paths that guide users from beginner to expert level with clear milestones, time estimates, curated resources, and progress tracking. Roadmaps include comprehensive course sequences, project-based learning, skill assessments, and career-oriented paths for various technical and non-technical domains. Each roadmap is customizable based on user goals and current skill level.', '{"feature": "roadmaps", "priority": "high", "keywords": ["roadmaps", "learning paths", "milestones", "progress", "career"]}', '/roadmaps'),

('expert-chat-001', 'feature', 'Expert Chat Support', 'Connect with human experts for personalized guidance, ask specific questions, get mentorship, and receive professional advice. The system combines AI assistance with human expertise for comprehensive learning support, featuring real-time chat sessions, expert matching based on topics, session history, and follow-up capabilities.', '{"feature": "expert", "priority": "medium", "keywords": ["expert", "chat", "mentorship", "guidance", "human"]}', '/expert'),

('community-learning-001', 'feature', 'Community Learning Platform', 'Collaborative learning environment where users can create communities, share knowledge, participate in discussions, vote on content, and learn together. Features include threaded discussions, voting systems, community moderation, shared resources, and peer-to-peer learning opportunities across various subjects and skill levels.', '{"feature": "community", "priority": "medium", "keywords": ["community", "collaboration", "discussions", "voting", "peer learning"]}', '/community'),

-- Technical Features
('ai-integration-001', 'feature', 'AI Integration and Analytics', 'Comprehensive AI metrics tracking, performance monitoring, and intelligent content generation across all platform features. The system uses multiple AI providers including GROQ for quiz generation, OpenAI for embeddings, and custom algorithms for personalized recommendations and adaptive learning experiences.', '{"feature": "ai", "priority": "medium", "keywords": ["AI", "analytics", "metrics", "GROQ", "OpenAI"]}', '/analytics'),

('interactive-tools-001', 'feature', 'Interactive Learning Tools', 'Advanced interactive tools including whiteboards for visual learning, code playgrounds for programming practice, notebooks for organized note-taking, language tutoring for multilingual learning, and speech synthesis for audio content. All tools are integrated with AI assistance for enhanced learning experiences.', '{"feature": "tools", "priority": "medium", "keywords": ["interactive", "whiteboards", "code", "notebooks", "language"]}', '/tools'),

-- User Experience
('user-achievements-001', 'feature', 'Achievements and Gamification', 'Comprehensive achievement system with XP points, badges, level progression, streak tracking, and leaderboards. The gamification system includes coins earned through quiz completion, milestone celebrations, and social recognition features that motivate continued learning and engagement.', '{"feature": "achievements", "priority": "medium", "keywords": ["achievements", "gamification", "XP", "badges", "coins"]}', '/achievements'),

-- Getting Started Guide
('getting-started-001', 'guide', 'Getting Started with Learnify', 'New to Learnify? Start by creating your profile, exploring our course catalog, taking your first quiz, or uploading a PDF for analysis. The platform adapts to your learning style and provides personalized recommendations. Begin with beginner-friendly content and gradually progress to more advanced topics as you build confidence and skills.', '{"category": "guide", "priority": "high", "keywords": ["getting started", "beginner", "tutorial", "onboarding"]}', '/getting-started');

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE learnify_content_vectors ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all content
CREATE POLICY "Allow authenticated users to read content vectors" 
ON learnify_content_vectors FOR SELECT 
TO authenticated 
USING (true);

-- Allow service role to manage content (for AI operations)
CREATE POLICY "Allow service role to manage content vectors" 
ON learnify_content_vectors FOR ALL 
TO service_role 
USING (true);

-- Grant appropriate permissions
GRANT SELECT ON learnify_content_vectors TO authenticated;
GRANT ALL ON learnify_content_vectors TO service_role;
GRANT EXECUTE ON FUNCTION search_learnify_content TO authenticated;
GRANT EXECUTE ON FUNCTION search_learnify_content TO service_role;

-- Add replica identity for better replication (if using logical replication)
ALTER TABLE learnify_content_vectors REPLICA IDENTITY FULL;