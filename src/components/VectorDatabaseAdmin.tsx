import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, AlertCircle, Play, Search, FileText, Sparkles } from 'lucide-react';
import { initializeVectorDatabase, testSearchFunctionality } from '../services/embeddingService';

export default function VectorDatabaseAdmin() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initStatus, setInitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    totalChunks: number;
    contentTypes: string[];
    lastUpdated: string;
  } | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    setInitStatus('idle');
    addLog('Starting knowledge base initialization...');

    try {
      await initializeVectorDatabase();
      setInitStatus('success');
      addLog('✅ Knowledge base initialized successfully!');
      await analyzeDatabase(); // Refresh stats after initialization
    } catch (error) {
      setInitStatus('error');
      addLog(`❌ Error initializing database: ${error}`);
      console.error('Initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    addLog('Starting search functionality test...');

    try {
      await testSearchFunctionality();
      setTestStatus('success');
      addLog('✅ Search functionality test completed successfully!');
    } catch (error) {
      setTestStatus('error');
      addLog(`❌ Error testing search: ${error}`);
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const analyzeDatabase = async () => {
    setIsAnalyzing(true);
    setAnalysisStatus('idle');
    addLog('Analyzing knowledge base content...');

    try {
      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('../lib/supabase');
      
      // Get total count and content types
      const { data: contentData, error: contentError } = await supabase
        .from('learnify_content_vectors')
        .select('content_type, created_at');

      if (contentError) {
        throw new Error('Failed to analyze database content');
      }

      if (contentData) {
        const totalChunks = contentData.length;
        const contentTypes = [...new Set(contentData.map(item => item.content_type))];
        const lastUpdated = contentData.length > 0 
          ? new Date(Math.max(...contentData.map(item => new Date(item.created_at).getTime()))).toLocaleString()
          : 'Never';

        setStats({
          totalChunks,
          contentTypes,
          lastUpdated
        });

        setAnalysisStatus('success');
        addLog(`✅ Analysis complete: ${totalChunks} chunks, ${contentTypes.length} content types`);
      }
    } catch (error) {
      setAnalysisStatus('error');
      addLog(`❌ Error analyzing database: ${error}`);
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze on component mount
  useEffect(() => {
    analyzeDatabase();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background rounded-lg shadow-lg border border-border">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Knowledge Base Administration</h2>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Content Statistics</h3>
            <p className="text-2xl font-bold text-primary">{stats.totalChunks}</p>
            <p className="text-sm text-muted-foreground">Total Content Chunks</p>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Content Types</h3>
            <p className="text-2xl font-bold text-accent-foreground">{stats.contentTypes.length}</p>
            <p className="text-sm text-muted-foreground">{stats.contentTypes.join(', ')}</p>
          </div>
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Last Updated</h3>
            <p className="text-sm font-medium text-secondary-foreground">{stats.lastUpdated}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Initialize Database */}
        <div className="border border-border rounded-lg p-4 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-card-foreground">
            <RefreshCw className="h-5 w-5 text-primary mr-2" />
            <span>Initialize Knowledge Base</span>
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Load existing Learnify content (courses, roadmaps, scraped pages) into the knowledge base for intelligent search.
          </p>
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                <span>Initialize</span>
              </>
            )}
          </button>
          {initStatus === 'success' && (
            <div className="mt-2 flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Initialization completed successfully!</span>
            </div>
          )}
          {initStatus === 'error' && (
            <div className="mt-2 flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Initialization failed. Check logs for details.</span>
            </div>
          )}
        </div>

        {/* Test Search */}
        <div className="border border-border rounded-lg p-4 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-card-foreground">
            <Search className="h-5 w-5 text-primary mr-2" />
            <span>Test Search System</span>
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Test both text and vector search functionality to ensure the hybrid system is working correctly.
          </p>
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="w-full bg-accent text-accent-foreground py-2 px-4 rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                <span>Run Tests</span>
              </>
            )}
          </button>
          {testStatus === 'success' && (
            <div className="mt-2 flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">All tests passed successfully!</span>
            </div>
          )}
          {testStatus === 'error' && (
            <div className="mt-2 flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Some tests failed. Check logs for details.</span>
            </div>
          )}
        </div>

        {/* Analyze Database */}
        <div className="border border-border rounded-lg p-4 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-card-foreground">
            <FileText className="h-5 w-5 text-primary mr-2" />
            <span>Analyze Content</span>
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Analyze the current knowledge base content and get detailed statistics about your data.
          </p>
          <button
            onClick={analyzeDatabase}
            disabled={isAnalyzing}
            className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                <span>Analyze</span>
              </>
            )}
          </button>
          {analysisStatus === 'success' && (
            <div className="mt-2 flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Analysis completed successfully!</span>
            </div>
          )}
          {analysisStatus === 'error' && (
            <div className="mt-2 flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Analysis failed. Check logs for details.</span>
            </div>
          )}
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="border border-border rounded-lg p-4 mb-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3 text-card-foreground">Activity Logs</h3>
          <div className="bg-muted/50 rounded-md p-3 max-h-64 overflow-y-auto border border-border">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-foreground mb-1">
                {log}
              </div>
            ))}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear Logs
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Base Setup Guide</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>First, ensure you have run the vector database migration in Supabase</li>
          <li><strong>Optional:</strong> Configure OpenAI API key for vector search (hybrid system works without it)</li>
          <li>Click "Initialize Knowledge Base" to load existing content from your database</li>
          <li>Run "Test Search System" to verify both text and vector search are working</li>
          <li>Use "Analyze Content" to get insights about your knowledge base</li>
          <li>Your AI chatbot now uses the hybrid intelligent search system!</li>
        </ol>
        <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This system works with both text-based and vector-based search. 
            Vector search requires an OpenAI API key, but the system gracefully falls back to text search for cost-effective operation.
          </p>
        </div>
      </div>
    </div>
  );
}
