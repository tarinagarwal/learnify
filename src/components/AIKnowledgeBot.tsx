import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { generateAIResponse, generateStreamingResponse } from '../services/knowledgeBase';

// Markdown Content Renderer Component
const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  const formatContent = (text: string) => {
    return text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-700 dark:text-gray-200">$1</strong>')
      // Bullet points: • or * at start of line
      .replace(/^[•*]\s+/gm, '• ')
      // Line breaks
      .replace(/\n/g, '<br/>')
      // Links (basic): [text](url) -> <a>text</a>
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
      );
  };

  return (
    <div
      className="formatted-content leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
};

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  sources?: string[];
  confidence?: 'high' | 'medium' | 'low';
  isStreaming?: boolean;
}

export default function AIKnowledgeBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string, content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageId = useRef<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Hi! 👋 I'm your AI learning assistant, powered by Learnify's comprehensive knowledge base using advanced vector search technology. I can provide intelligent, contextual answers about courses, quizzes, PDFs, roadmaps, and learning strategies. How can I help you learn today?",
        isBot: true,
        timestamp: new Date(),
        confidence: 'high',
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    const newUserHistory = { role: 'user', content: inputMessage.trim() };
    setConversationHistory(prev => [...prev, newUserHistory]);

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    streamingMessageId.current = botMessageId;

    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      content: '',
      isBot: true,
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, initialBotMessage]);

    try {
      await generateStreamingResponse(
        currentQuery,
        conversationHistory,
        (chunk: string, sources?: string[], confidence?: 'high' | 'medium' | 'low') => {
          setMessages(prev => prev.map(msg =>
            msg.id === botMessageId
              ? {
                ...msg,
                content: msg.content + chunk,
                sources: sources || msg.sources,
                confidence: confidence || msg.confidence,
                isStreaming: chunk.length > 0
              }
              : msg
          ));
        }
      );

      const finalMessage = messages.find(m => m.id === botMessageId);
      if (finalMessage) {
        const newBotHistory = { role: 'assistant', content: finalMessage.content };
        setConversationHistory(prev => [...prev, newBotHistory]);
      }

      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error('Error generating AI response:', error);

      try {
        const response = await generateAIResponse(currentQuery);

        setMessages(prev => prev.map(msg =>
          msg.id === botMessageId
            ? {
              ...msg,
              content: response.content,
              sources: response.sources,
              confidence: response.confidence,
              isStreaming: false
            }
            : msg
        ));

        const newBotHistory = { role: 'assistant', content: response.content };
        setConversationHistory(prev => [...prev, newBotHistory]);

      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);

        const errorMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team.";

        setMessages(prev => prev.map(msg =>
          msg.id === botMessageId
            ? {
              ...msg,
              content: errorMessage,
              isStreaming: false
            }
            : msg
        ));
      }
    } finally {
      setIsLoading(false);
      streamingMessageId.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationHistory([]);
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Hi! 👋 I'm your AI learning assistant. How can I help you learn today?",
        isBot: true,
        timestamp: new Date(),
        confidence: 'high',
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-96 max-h-[600px] flex flex-col border border-gray-200 dark:border-zinc-700">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-medium">AI Learning Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearConversation}
                className="text-white hover:text-gray-200 transition-colors text-xs bg-white/20 px-2 py-1 rounded"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[400px] space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%]`}>
                  {message.isBot && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.isBot
                        ? 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      <MessageContent content={message.content} />
                      {message.isStreaming && (
                        <span className="inline-block w-1 h-4 bg-purple-500 animate-pulse ml-1"></span>
                      )}
                    </div>

                    {message.confidence && !message.isStreaming && (
                      <div className="mt-2 flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          message.confidence === 'high' ? 'bg-green-500' :
                          message.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {message.confidence} confidence
                        </span>
                        {conversationHistory.length > 2 && (
                          <span className="text-xs text-purple-500">• Context-aware</span>
                        )}
                      </div>
                    )}

                    {message.sources && message.sources.length > 0 && !message.isStreaming && (
                      <div className="mt-2 pt-2 border-t border-gray-300 dark:border-zinc-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Sources:</p>
                        <ul className="text-xs text-gray-500 dark:text-gray-300 space-y-1">
                          {message.sources.map((source, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-purple-500 mr-1">•</span>
                              <span className="hover:text-purple-600 cursor-pointer">{source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {!message.isBot && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-200" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && !streamingMessageId.current && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-zinc-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your learning..."
                className="flex-1 rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm bg-white dark:bg-zinc-800 text-black dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md px-4 py-2 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by Learnify Knowledge Base
              </p>
              {conversationHistory.length > 0 && (
                <p className="text-xs text-purple-500">
                  {Math.floor(conversationHistory.length / 2)} turns
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-3 shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 relative"
          title="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
          {conversationHistory.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          )}
        </button>
      )}
    </div>
  );
}
