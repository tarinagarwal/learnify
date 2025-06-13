"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Clock, Trash2, Sparkles } from "lucide-react";
import { useBlackboardStore } from "../store/blackboardStore";

interface Whiteboard {
  id: string;
  title: string;
  created_at: string;
  drawing_data: unknown[];
}

export const History: React.FC = () => {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { loadSavedWhiteboard } = useBlackboardStore();

  useEffect(() => {
    loadWhiteboards();
  }, []);

  const loadWhiteboards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("whiteboards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWhiteboards(data || []);
    } catch (error) {
      console.error("Error loading whiteboards:", error);
      alert("Error loading whiteboard history.");
    } finally {
      setLoading(false);
    }
  };

  const deleteWhiteboard = async (id: string) => {
    try {
      const { error } = await supabase
        .from("whiteboards")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setWhiteboards(whiteboards.filter((wb) => wb.id !== id));
    } catch (error) {
      console.error("Error deleting whiteboard:", error);
      alert("Error deleting whiteboard.");
    }
  };

  const viewWhiteboard = async (whiteboard: Whiteboard) => {
    await loadSavedWhiteboard(whiteboard.drawing_data);
    navigate(
      `/whiteboard?id=${whiteboard.id}&title=${encodeURIComponent(
        whiteboard.title
      )}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background text-foreground">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <p className="mt-6 text-xl text-foreground">Loading Whiteboards...</p>
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
              <Clock className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
              Whiteboard History
            </h2>
            <p className="mt-2 text-xl text-muted-foreground">
              View and manage your saved whiteboards
            </p>
          </div>
        </div>

        {whiteboards.length === 0 ? (
          <div className="text-center py-16 bg-card/50 backdrop-blur-sm border border-border rounded-xl">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-card-foreground mb-2">
              No whiteboards yet
            </h3>
            <p className="text-muted-foreground">
              Start creating your first whiteboard!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whiteboards.map((whiteboard) => (
              <div
                key={whiteboard.id}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300 cursor-pointer"
                onClick={() => viewWhiteboard(whiteboard)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-card-foreground">
                      {whiteboard.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWhiteboard(whiteboard.id);
                      }}
                      className="text-muted-foreground hover:text-destructive hover:bg-muted p-1 rounded transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Created:{" "}
                    {new Date(whiteboard.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-grow bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.min(
                            100,
                            (whiteboard.drawing_data.length / 50) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {whiteboard.drawing_data.length} strokes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
};
