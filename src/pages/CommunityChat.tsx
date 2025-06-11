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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/community")}
            className="mb-4 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>

          <Card className="bg-gray-800/50 border-b border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">{community?.title}</CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                {community?.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {community?.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-4 bg-gray-800/50 border-b border-gray-700">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-gray-400">
                    No messages yet. Be the first to start the conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex flex-col space-y-2 p-3 rounded-lg bg-gray-900/50 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm text-purple-400">
                          {message.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{message.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleVote(message.id, "upvote")}
                          className={`flex items-center gap-1 ${
                            message.userVote === "upvote"
                              ? "text-green-400"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-xs">{message.upvotes}</span>
                        </button>
                        <button
                          onClick={() => handleVote(message.id, "downvote")}
                          className={`flex items-center gap-1 ${
                            message.userVote === "downvote"
                              ? "text-red-400"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span className="text-xs">{message.downvotes}</span>
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

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
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
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
