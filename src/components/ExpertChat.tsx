import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Clock, User, Bot, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChatSession {
  id: string;
  reason: string;
  status: 'pending' | 'active' | 'closed';
  expert_id: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  is_expert: boolean;
  created_at: string;
  sender_id: string;
}

export default function ExpertChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'initial' | 'reason' | 'chat'>('initial');
  const [reason, setReason] = useState('');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkExistingSession();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentSession?.id) {
      fetchMessages();
      const messagesSubscription = subscribeToMessages();
      const sessionSubscription = subscribeToSessionUpdates();

      return () => {
        messagesSubscription?.unsubscribe();
        sessionSubscription?.unsubscribe();
      };
    }
  }, [currentSession?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkExistingSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      setCurrentSession(sessions[0]);
      setStep('chat');
    }
  };

  const fetchMessages = async () => {
    if (!currentSession) return;

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', currentSession.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    if (!currentSession) return;

    return supabase
      .channel(`messages:${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${currentSession.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();
  };

  const subscribeToSessionUpdates = () => {
    if (!currentSession) return;

    return supabase
      .channel(`session:${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_sessions',
          filter: `id=eq.${currentSession.id}`,
        },
        (payload) => {
          const updatedSession = payload.new as ChatSession;
          setCurrentSession(updatedSession);
          if (updatedSession.status === 'closed') {
            setCurrentSession(null);
            setMessages([]);
            setStep('initial');
          }
        }
      )
      .subscribe();
  };

  const startSession = async () => {
    if (!reason.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        reason: reason.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return;
    }

    setCurrentSession(session);
    setStep('chat');
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSession.id,
        sender_id: user.id,
        is_expert: false,
        content: newMessage.trim(),
      });

    if (!error) {
      setNewMessage('');
    }
  };

  const closeSession = async () => {
    if (!currentSession) return;

    await supabase
      .from('chat_sessions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', currentSession.id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl shadow-xl w-96 max-h-[600px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-primary rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-foreground/20 rounded-full">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-medium text-primary-foreground">Expert Chat</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-primary-foreground hover:text-primary-foreground/80 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[400px] bg-card/50">
            {step === 'initial' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-lg font-medium text-card-foreground mb-2">Connect with Experts</h4>
                <p className="text-muted-foreground mb-6">Get personalized assistance from our learning experts</p>
                <button
                  onClick={() => setStep('reason')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start a Session
                </button>
              </div>
            )}

            {step === 'reason' && (
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-3">
                  What would you like to discuss?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 p-3"
                  rows={4}
                  placeholder="Describe your question or topic in detail..."
                />
                <button
                  onClick={startSession}
                  disabled={loading || !reason.trim()}
                  className="mt-4 w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                      Creating Session...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            )}

            {step === 'chat' && (
              <>
                {currentSession?.status === 'pending' ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center p-3 bg-yellow-500/20 rounded-full mb-4">
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h4 className="text-lg font-medium text-card-foreground mb-2">Finding an Expert</h4>
                    <p className="text-muted-foreground">Please wait while we connect you with the right expert...</p>
                    <div className="mt-4 flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.is_expert ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div className={`flex items-start gap-2 max-w-[85%] ${
                          message.is_expert ? 'flex-row' : 'flex-row-reverse'
                        }`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.is_expert 
                              ? 'bg-accent/20' 
                              : 'bg-primary/20'
                          }`}>
                            {message.is_expert ? (
                              <Bot className="h-4 w-4 text-accent-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div
                            className={`rounded-xl px-4 py-3 ${
                              message.is_expert
                                ? 'bg-muted/50 text-foreground border border-border'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <span className={`text-xs mt-1 block ${
                              message.is_expert 
                                ? 'text-muted-foreground' 
                                : 'text-primary-foreground/70'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}
          </div>

          {step === 'chat' && currentSession?.status === 'active' && (
            <div className="p-4 border-t border-border bg-card/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 px-3 py-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center p-2 border border-transparent rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 'chat' && currentSession && (
            <div className="p-3 border-t border-border text-center bg-card/30">
              <button
                onClick={closeSession}
                className="text-sm text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-3 py-1 rounded-md transition-colors"
              >
                Close Session
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
