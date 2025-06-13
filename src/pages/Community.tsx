"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Community {
  id: string;
  title: string;
  description: string;
  tags: string[];
  user: {
    name: string;
  };
  _count?: {
    messages: number;
  };
}

export default function Community() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showNewCommunityDialog, setShowNewCommunityDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Form data for new community
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("communities_with_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get message counts for each community
      const communitiesWithCounts = await Promise.all(
        (data || []).map(async (community) => {
          const { count } = await supabase
            .from("community_messages")
            .select("*", { count: "exact", head: true })
            .eq("community_id", community.id);

          return {
            ...community,
            user: {
              name: community.user_name,
            },
            _count: {
              messages: count || 0,
            },
          };
        })
      );

      setCommunities(communitiesWithCounts);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      // checking errors hence data is removed as not used
      const { error } = await supabase
        .from("communities")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            tags,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowNewCommunityDialog(false);
      setFormData({ title: "", description: "", tags: "" });
      fetchCommunities();
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };

  const filteredCommunities = communities.filter(
    (community) =>
      community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900/30">
          {/* Animated grid background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff0a_1px,transparent_1px),linear-gradient(135deg,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          {/* Animated particles */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: `rgba(${Math.random() * 100 + 155}, ${
                    Math.random() * 100 + 155
                  }, 255, ${Math.random() * 0.5 + 0.5})`,
                  boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${
                    Math.random() * 100 + 155
                  }, ${Math.random() * 100 + 155}, 255, ${
                    Math.random() * 0.5 + 0.5
                  })`,
                  animation: `float ${
                    Math.random() * 10 + 20
                  }s linear infinite`,
                  animationDelay: `${Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 backdrop-blur-sm rounded-full mb-4">
              <Users className="mx-auto h-16 w-16 text-purple-400" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400">
              Community Learning
            </h2>
            <p className="mt-2 text-xl text-gray-300 max-w-2xl mx-auto">
              Connect with other learners, share knowledge, and learn together
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            onClick={() => setShowNewCommunityDialog(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card
              key={community.id}
              className="cursor-pointer transition-all duration-300 bg-gray-800/50 border-b border-gray-700 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] text-white"
              onClick={() => navigate(`/community/${community.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-white">{community.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {community.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {community.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Created by {community.user?.name}</span>
                  <span>{community._count?.messages || 0} messages</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Community Dialog */}
        <Dialog
          open={showNewCommunityDialog}
          onOpenChange={setShowNewCommunityDialog}
        >
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create New Community
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-gray-300">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="react, typescript, web development"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Create Community
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
