"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Translate } from "../components/Translate";

interface Message {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  user: {
    name: string;
  };
  userVote?: "upvote" | "downvote" | null;
}

interface Community {
  id: string;
  title: string;
  description: string;
  tags: string[];
  user: {
    name: string;
  };
}

export default function CommunityChat() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMessages();
      subscribeToMessages();
      subscribeToVotes();
    }
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from("communities_with_users")
        .select("*")
        .eq("id", communityId)
        .single();

      if (error) throw error;
      if (data) {
        setCommunity({
          ...data,
          user: {
            name: data.user_name,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching community:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: messages, error } = await supabase
        .from("community_messages_with_users")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const messagesWithVotes = await Promise.all(
        (messages || []).map(async (message) => {
          const { data: vote } = await supabase
            .from("message_votes")
            .select("vote_type")
            .eq("message_id", message.id)
            .eq("user_id", user.id)
            .maybeSingle();

          return {
            ...message,
            user: {
              name: message.user_name,
            },
            userVote: vote?.vote_type || null,
          };
        })
      );

      setMessages(messagesWithVotes);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`messages:${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_messages",
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const subscribeToVotes = () => {
    const subscription = supabase
      .channel(`votes:${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_votes",
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleVote = async (
    messageId: string,
    voteType: "upvote" | "downvote"
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const message = messages.find((m) => m.id === messageId);
      if (!message) return;

      if (message.userVote === voteType) {
        // Remove vote
        await supabase
          .from("message_votes")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", user.id);
      } else {
        // Upsert vote
        await supabase.from("message_votes").upsert(
          {
            message_id: messageId,
            user_id: user.id,
            vote_type: voteType,
          },
          {
            onConflict: "message_id,user_id",
          }
        );
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !communityId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("community_messages").insert({
        community_id: communityId,
        user_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <p className="mt-6 text-xl text-foreground">
            <Translate>Loading Community...</Translate>
          </p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/community")}
            className="mb-4 text-muted-foreground hover:text-primary hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <Translate>Back to Communities</Translate>
          </Button>

          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-card-foreground text-2xl">
                    {community?.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Translate>Community Discussion</Translate>
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                {community?.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {community?.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    <Translate>Start the Conversation</Translate>
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    <Translate>
                      No messages yet. Be the first to start the conversation and
                      share your thoughts with the community!
                    </Translate>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex flex-col space-y-3 p-4 rounded-xl bg-muted/50 backdrop-blur-sm border border-border hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm text-primary">
                          {message.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleVote(message.id, "upvote")}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 ${
                            message.userVote === "upvote"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "text-muted-foreground hover:text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {message.upvotes}
                          </span>
                        </button>
                        <button
                          onClick={() => handleVote(message.id, "downvote")}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 ${
                            message.userVote === "downvote"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {message.downvotes}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your thoughts with the community..."
            className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <Translate>Send</Translate>
          </Button>
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
