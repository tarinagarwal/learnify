import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Send, X, MessageSquare, Clock, CheckCircle, Users, Sparkles } from "lucide-react";

interface ChatSession {
  id: string;
  reason: string;
  status: "pending" | "active" | "closed";
  created_at: string;
  user: {
    name: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  is_expert: boolean;
  created_at: string;
  sender_id: string;
}

export default function ExpertDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [expertId, setExpertId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeExpert = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: expert } = await supabase
          .from("experts")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (expert) {
          setExpertId(expert.id);
          fetchSessions();
        }
      }
    };

    initializeExpert();
  }, []);

  useEffect(() => {
    if (expertId) {
      const subscription = subscribeToSessions();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [expertId]);

  useEffect(() => {
    if (selectedSession?.id) {
      fetchMessages();
      const subscription = subscribeToMessages();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [selectedSession?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from("chat_sessions")
      .select(
        `
        *,
        user:user_id (
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (data) {
      setSessions(data);
      // Update selected session if it exists in the new data
      if (selectedSession) {
        const updatedSession = data.find((s) => s.id === selectedSession.id);
        if (updatedSession) {
          setSelectedSession(updatedSession);
        }
      }
    }
  };

  const subscribeToSessions = () => {
    return supabase
      .channel("sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions",
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();
  };

  const fetchMessages = async () => {
    if (!selectedSession) return;

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", selectedSession.id)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedSession) return;

    return supabase
      .channel(`messages:${selectedSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${selectedSession.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();
  };

  const acceptSession = async (session: ChatSession) => {
    if (!expertId) return;

    await supabase
      .from("chat_sessions")
      .update({
        expert_id: expertId,
        status: "active",
      })
      .eq("id", session.id);

    setSelectedSession({ ...session, status: "active" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || !expertId) return;

    const { error } = await supabase.from("chat_messages").insert({
      session_id: selectedSession.id,
      sender_id: expertId,
      is_expert: true,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
  };

  const closeSession = async () => {
    if (!selectedSession) return;

    await supabase
      .from("chat_sessions")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", selectedSession.id);

    setSelectedSession(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated grid background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0 opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px hsl(var(--primary) / 0.3)`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 border border-accent text-sm font-medium rounded-full text-foreground bg-accent/20 backdrop-blur-sm mb-4">
            <Users className="w-4 h-4 mr-2 text-primary" />
            Expert Support System
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary pb-4">
            Expert Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage and respond to learner inquiries with real-time chat support
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-card/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Support Sessions
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-300px)]">
            {/* Sessions List */}
            <div className="w-1/3 border-r border-border bg-muted/20">
              <div className="p-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Active Sessions ({sessions.filter(s => s.status !== "closed").length})
                </h4>
                <div className="space-y-3">
                  {sessions
                    .filter((s) => s.status !== "closed")
                    .map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                          selectedSession?.id === session.id
                            ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                            : "bg-card/50 border-border hover:bg-card/80 hover:border-primary/20"
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-card-foreground">{session.user?.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            session.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
                              : "bg-green-500/20 text-green-600 border border-green-500/30"
                          }`}>
                            {session.status === "pending" ? "Pending" : "Active"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {session.reason}
                        </p>
                        {session.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptSession(session);
                            }}
                            className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Session
                          </button>
                        )}
                      </div>
                    ))}
                  {sessions.filter(s => s.status !== "closed").length === 0 && (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">No active sessions</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        New support requests will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            {selectedSession ? (
              <div className="flex-1 flex flex-col bg-background/50">
                {/* Chat Header */}
                <div className="p-6 border-b border-border bg-card/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold text-card-foreground">
                        {selectedSession.user?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedSession.reason}
                      </p>
                    </div>
                    <button
                      onClick={closeSession}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.is_expert ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-4 py-3 ${
                              message.is_expert
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground border border-border"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.is_expert 
                                ? "text-primary-foreground/70" 
                                : "text-muted-foreground"
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Start the Conversation
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                          Begin chatting with {selectedSession.user?.name} to provide expert assistance
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                {selectedSession.status === "active" && (
                  <div className="p-6 border-t border-border bg-card/30">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="inline-flex items-center justify-center p-3 border border-transparent rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedSession.status === "pending" && (
                  <div className="p-6 border-t border-border bg-card/30">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        Accept this session to start chatting
                      </p>
                      <button
                        onClick={() => acceptSession(selectedSession)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Accept Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center bg-muted/10">
                <div>
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Select a Session
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a support session from the left panel to start providing expert assistance
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
