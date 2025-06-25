"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Plus, Search, Users, Sparkles } from "lucide-react";
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
import { Translate } from "../components/Translate";

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
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <p className="mt-6 text-xl text-foreground">
            <Translate>Loading Communities...</Translate>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with animated background */}
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-primary/10">
          {/* Animated grid background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          {/* Animated particles */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-primary/20"
                style={{
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: `0 0 ${Math.random() * 10 + 5}px hsl(var(--primary) / 0.3)`,
                  animation: `float ${
                    Math.random() * 10 + 20
                  }s linear infinite`,
                  animationDelay: `${Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/20 backdrop-blur-sm rounded-full mb-4">
              <Users className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
              <Translate>Community Learning</Translate>
            </h2>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
              <Translate>
                Connect with other learners, share knowledge, and learn together
              </Translate>
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            onClick={() => setShowNewCommunityDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            <Translate>Create Community</Translate>
          </Button>
        </div>

        {filteredCommunities.length === 0 ? (
          <Card className="text-center p-8 bg-card/50 backdrop-blur-sm border-border">
            <CardContent>
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl text-card-foreground">
                <Translate>No communities found</Translate>
              </p>
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? "Try a different search term or create a new community"
                  : "Be the first to create a community and start learning together"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Card
                key={community.id}
                className="cursor-pointer transition-all duration-300 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20"
                onClick={() => navigate(`/community/${community.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    {community.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {community.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Created by {community.user?.name}</span>
                    <span>{community._count?.messages || 0} messages</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Community Dialog */}
        <Dialog
          open={showNewCommunityDialog}
          onOpenChange={setShowNewCommunityDialog}
        >
          <DialogContent className="bg-card border-border text-card-foreground">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                <Translate>New Community</Translate>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-muted-foreground">
                  <Translate>Title</Translate>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="bg-input border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-muted-foreground">
                  <Translate>Description</Translate>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="bg-input border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-muted-foreground">
                  <Translate>Tags</Translate>
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="react, typescript, web development"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Translate>Create</Translate>
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
