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
  drawing_data: any[];
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-950 text-gray-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-purple-400 animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-purple-400" />
          </div>
          <p className="mt-6 text-xl text-gray-100">Loading Whiteboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with animated background */}
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
              <Clock className="h-16 w-16 text-purple-400" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400">
              Whiteboard History
            </h2>
            <p className="mt-2 text-xl text-gray-300">
              View and manage your saved whiteboards
            </p>
          </div>
        </div>

        {whiteboards.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl">
            <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-100 mb-2">
              No whiteboards yet
            </h3>
            <p className="text-gray-400">
              Start creating your first whiteboard!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whiteboards.map((whiteboard) => (
              <div
                key={whiteboard.id}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer"
                onClick={() => viewWhiteboard(whiteboard)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-100">
                      {whiteboard.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWhiteboard(whiteboard.id);
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Created:{" "}
                    {new Date(whiteboard.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-grow bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (whiteboard.drawing_data.length / 50) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
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
      <style
        //@ts-ignore
        jsx
      >{`
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