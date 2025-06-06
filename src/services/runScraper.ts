#!/usr/bin/env ts-node

import { LearnifyContentScraper } from './contentScraper';

async function main() {
  const scraper = new LearnifyContentScraper('http://localhost:5173');
  
  try {
    console.log('🚀 Starting Learnify Content Acquisition (Phase 1)...');
    console.log('📋 Make sure your dev server is running on localhost:5173');
    console.log('');

    // Initialize browser
    await scraper.initialize();

    // Run the scraping process
    console.log('⏱️  This may take 2-3 minutes...');
    await scraper.scrapeAllContent();

    // Store in database
    await scraper.storeContent();

    // Show final statistics
    const stats = scraper.getStats();
    console.log('');
    console.log('📊 SCRAPING COMPLETE!');
    console.log('====================');
    console.log(`📄 Pages scraped: ${stats.pagesScraped}`);
    console.log(`📦 Content chunks: ${stats.chunksGenerated}`);
    console.log(`📝 Total words: ${stats.totalWords.toLocaleString()}`);
    console.log(`📏 Avg chunk size: ${stats.avgChunkSize} words`);
    console.log('');
    console.log('🎉 Your knowledge base is now supercharged!');
    console.log('💬 Test your chatbot - it should have much more comprehensive responses!');

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Scraping interrupted by user');
  process.exit(0);
});

// Run the scraper
main().catch(console.error);