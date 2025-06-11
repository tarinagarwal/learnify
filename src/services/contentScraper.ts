import puppeteer, { Browser, Page } from 'puppeteer';
import { supabase } from '../lib/supabase';

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  metadata: {
    section: string;
    timestamp: string;
    contentType: string;
    wordCount: number;
    tags: string[];
  };
}

export interface ContentChunk {
  content_id: string;
  content_type: string;
  title: string;
  content_chunk: string;
  chunk_index: number;
  metadata: Record<string, any>;
  source_url: string;
}

export class LearnifyContentScraper {
  private browser: Browser | null = null;
  private baseUrl: string;
  private scrapedUrls: Set<string> = new Set();
  private contentChunks: ContentChunk[] = [];

  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize the browser
   */
  async initialize(): Promise<void> {
    console.log('🚀 Starting Learnify content scraper...');
    this.browser = await puppeteer.launch({
      headless: true, // Fixed: Changed from 'new' to true for compatibility
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Scraper closed');
  }

  /**
   * Main scraping orchestrator
   */
  async scrapeAllContent(): Promise<void> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    console.log('📊 Starting comprehensive content scraping...');

    // Define all routes to scrape
    const routes = [
      // Core pages
      { url: '/', section: 'homepage', type: 'page' },
      { url: '/about', section: 'about', type: 'page' },
      { url: '/contact', section: 'contact', type: 'page' },
      { url: '/privacy', section: 'legal', type: 'page' },
      { url: '/terms', section: 'legal', type: 'page' },
      
      // Feature pages
      { url: '/quiz', section: 'features', type: 'feature' },
      { url: '/courses', section: 'features', type: 'feature' },
      { url: '/resources', section: 'features', type: 'feature' },
      { url: '/roadmaps', section: 'features', type: 'feature' },
      { url: '/community', section: 'features', type: 'feature' },
      
      // Tool pages
      { url: '/pdf-chat', section: 'tools', type: 'tool' },
      { url: '/language-tutor', section: 'tools', type: 'tool' },
      { url: '/notebook', section: 'tools', type: 'tool' },
      
      // Learning pages
      { url: '/dashboard', section: 'learning', type: 'dashboard' },
      { url: '/profile', section: 'user', type: 'profile' }
    ];

    // Scrape static routes
    for (const route of routes) {
      await this.scrapePage(route.url, route.section, route.type);
      await this.delay(1000); // Be respectful
    }

    // Scrape dynamic content from database
    await this.scrapeDynamicContent();

    console.log(`📈 Scraped ${this.scrapedUrls.size} pages, generated ${this.contentChunks.length} content chunks`);
  }

  /**
   * Scrape a single page
   */
  private async scrapePage(route: string, section: string, contentType: string): Promise<void> {
    const page = await this.browser!.newPage();
    
    try {
      const url = this.baseUrl + route;
      console.log(`📄 Scraping: ${url}`);

      // Navigate and wait for content
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Fixed: Replace waitForTimeout with a more compatible approach
      await page.waitForFunction(() => document.readyState === 'complete');
      await this.delay(2000); // Use our own delay function

      // Extract page content
      const pageData = await page.evaluate(() => {
        // Remove navigation, footer, and other non-content elements
        const elementsToRemove = [
          'nav', 'footer', 'header', 
          '[class*="nav"]', '[class*="sidebar"]',
          '[class*="menu"]', 'script', 'style'
        ];
        
        elementsToRemove.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });

        // Get title
        const title = document.title || 
                     document.querySelector('h1')?.textContent || 
                     'Learnify Page';

        // Get main content
        const contentSelectors = [
          'main', '[role="main"]', '.main-content',
          '.content', '#content', 'article'
        ];

        let content = '';
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            content = element.textContent || '';
            break;
          }
        }

        // Fallback to body if no main content found
        if (!content) {
          content = document.body.textContent || '';
        }

        // Clean up content
        content = content
          .replace(/\s+/g, ' ')           // Normalize whitespace
          .replace(/\n{3,}/g, '\n\n')     // Remove excessive newlines
          .trim();

        // Extract metadata
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
          .map(h => h.textContent?.trim())
          .filter((text): text is string => Boolean(text)); // Fixed: Proper type guard

        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        return {
          title: title.trim(),
          content,
          headings, // Now properly typed as string[]
          description,
          wordCount: content.split(' ').length
        };
      });

      // Only process if we got meaningful content
      if (pageData.content && pageData.content.length > 100) {
        const scrapedContent: ScrapedContent = {
          url: route,
          title: pageData.title,
          content: pageData.content,
          metadata: {
            section,
            timestamp: new Date().toISOString(),
            contentType,
            wordCount: pageData.wordCount,
            tags: this.extractTags(pageData.content, pageData.headings) // Fixed: Now properly typed
          }
        };

        // Chunk the content
        const chunks = this.chunkContent(scrapedContent);
        this.contentChunks.push(...chunks);
        this.scrapedUrls.add(route);

        console.log(`✅ Scraped: ${pageData.title} (${pageData.wordCount} words, ${chunks.length} chunks)`);
      } else {
        console.log(`⚠️ Skipped: ${route} (insufficient content)`);
      }

    } catch (error) {
      console.error(`❌ Error scraping ${route}:`, error);
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape dynamic content from database
   */
  private async scrapeDynamicContent(): Promise<void> {
    console.log('📊 Scraping dynamic content from database...');

    try {
      // Get courses
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .limit(50);

      if (courses) {
        for (const course of courses) {
          const scrapedContent: ScrapedContent = {
            url: `/courses/${course.id}`,
            title: course.title,
            content: `Course: ${course.title}\n\nDescription: ${course.description}\n\nThis course provides comprehensive learning materials and structured content to help you master the subject. Progress through lessons at your own pace and track your achievements.`,
            metadata: {
              section: 'courses',
              timestamp: course.created_at,
              contentType: 'course',
              wordCount: course.description?.split(' ').length || 0,
              tags: ['course', 'learning', course.title.toLowerCase()]
            }
          };

          const chunks = this.chunkContent(scrapedContent);
          this.contentChunks.push(...chunks);
        }
        console.log(`✅ Scraped ${courses.length} courses`);
      }

      // Get roadmaps
      const { data: roadmaps } = await supabase
        .from('roadmaps')
        .select('*')
        .limit(50);

      if (roadmaps) {
        for (const roadmap of roadmaps) {
          const scrapedContent: ScrapedContent = {
            url: `/roadmaps/${roadmap.id}`,
            title: roadmap.title,
            content: `Learning Roadmap: ${roadmap.title}\n\nDescription: ${roadmap.description}\n\nThis structured learning path guides you through progressive skill development with clear milestones and curated resources.`,
            metadata: {
              section: 'roadmaps',
              timestamp: roadmap.created_at,
              contentType: 'roadmap',
              wordCount: roadmap.description?.split(' ').length || 0,
              tags: ['roadmap', 'learning path', roadmap.title.toLowerCase()]
            }
          };

          const chunks = this.chunkContent(scrapedContent);
          this.contentChunks.push(...chunks);
        }
        console.log(`✅ Scraped ${roadmaps.length} roadmaps`);
      }

    } catch (error) {
      console.error('❌ Error scraping dynamic content:', error);
    }
  }

  /**
   * Chunk content into manageable pieces with overlap
   */
  private chunkContent(scrapedContent: ScrapedContent): ContentChunk[] {
    const chunks: ContentChunk[] = [];
    const { content, title, url, metadata } = scrapedContent;

    // Configuration
    const chunkSize = 1000; // characters
    const overlapSize = 200; // character overlap between chunks

    if (content.length <= chunkSize) {
      // Single chunk
      chunks.push({
        content_id: `${metadata.contentType}-${Date.now()}`,
        content_type: metadata.contentType,
        title,
        content_chunk: content,
        chunk_index: 0,
        metadata: {
          ...metadata,
          isComplete: true,
          totalChunks: 1
        },
        source_url: url
      });
    } else {
      // Multiple chunks with overlap
      let startIndex = 0;
      let chunkIndex = 0;

      while (startIndex < content.length) {
        const endIndex = Math.min(startIndex + chunkSize, content.length);
        let chunkContent = content.slice(startIndex, endIndex);

        // Try to break at sentence boundary if possible
        if (endIndex < content.length) {
          const lastSentence = chunkContent.lastIndexOf('.');
          if (lastSentence > chunkSize * 0.7) { // Don't break too early
            chunkContent = chunkContent.slice(0, lastSentence + 1);
          }
        }

        chunks.push({
          content_id: `${metadata.contentType}-${Date.now()}-${chunkIndex}`,
          content_type: metadata.contentType,
          title: `${title} (Part ${chunkIndex + 1})`,
          content_chunk: chunkContent.trim(),
          chunk_index: chunkIndex,
          metadata: {
            ...metadata,
            isComplete: false,
            totalChunks: -1, // Will be updated after all chunks are created
            partNumber: chunkIndex + 1
          },
          source_url: url
        });

        // Move to next chunk with overlap
        startIndex = endIndex - overlapSize;
        chunkIndex++;
      }

      // Update total chunks count
      chunks.forEach(chunk => {
        chunk.metadata.totalChunks = chunks.length;
      });
    }

    return chunks;
  }

  /**
   * Extract relevant tags from content - Fixed: Proper parameter types
   */
  private extractTags(content: string, headings: string[]): string[] {
    const commonTags = [
      'ai', 'learning', 'education', 'quiz', 'course', 'pdf', 'roadmap',
      'interactive', 'groq', 'chatbot', 'analytics', 'progress', 'study'
    ];

    const extractedTags: string[] = [];
    const contentLower = content.toLowerCase();

    // Add tags based on content keywords
    commonTags.forEach(tag => {
      if (contentLower.includes(tag)) {
        extractedTags.push(tag);
      }
    });

    // Add tags from headings - Fixed: Now properly handles string[] type
    headings.forEach(heading => {
      const words = heading.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3 && !extractedTags.includes(word)) {
          extractedTags.push(word);
        }
      });
    });

    return extractedTags.slice(0, 10); // Limit to 10 tags
  }

  /**
   * Store all chunks in the vector database
   */
  async storeContent(): Promise<void> {
    console.log(`💾 Storing ${this.contentChunks.length} content chunks...`);

    // Clear existing scraped content (optional - uncomment if you want fresh data)
    // await supabase
    //   .from('learnify_content_vectors')
    //   .delete()
    //   .in('content_type', ['page', 'feature', 'tool', 'course', 'roadmap']);

    // Batch insert
    const batchSize = 10;
    for (let i = 0; i < this.contentChunks.length; i += batchSize) {
      const batch = this.contentChunks.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('learnify_content_vectors')
        .insert(batch.map(chunk => ({
          content_id: chunk.content_id,
          content_type: chunk.content_type,
          title: chunk.title,
          content_chunk: chunk.content_chunk,
          chunk_index: chunk.chunk_index,
          metadata: chunk.metadata,
          source_url: chunk.source_url
        })));

      if (error) {
        console.error(`❌ Error storing batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`✅ Stored batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(this.contentChunks.length/batchSize)}`);
      }

      // Small delay between batches
      await this.delay(500);
    }

    console.log('🎉 Content storage complete!');
  }

  /**
   * Get scraping statistics
   */
  getStats(): {
    pagesScraped: number;
    chunksGenerated: number;
    totalWords: number;
    avgChunkSize: number;
  } {
    const totalWords = this.contentChunks.reduce((sum, chunk) => {
      return sum + (chunk.metadata.wordCount || chunk.content_chunk.split(' ').length);
    }, 0);

    const avgChunkSize = this.contentChunks.length > 0 
      ? Math.round(totalWords / this.contentChunks.length)
      : 0;

    return {
      pagesScraped: this.scrapedUrls.size,
      chunksGenerated: this.contentChunks.length,
      totalWords,
      avgChunkSize
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}