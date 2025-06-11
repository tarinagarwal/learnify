"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Trash2,
  PencilRuler,
  ArrowLeft,
  ArrowRight,
  MoveVertical,
  Sparkles,
} from "lucide-react";
import { AlertDialog } from "../components/AlertDialog";
import { useAuthStore } from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Whiteboard {
  id: string;
  title: string;
  created_at: string;
  order_index: number;
  drawing_data: unknown[];
  user_id: string;
  notebook_id: string;
}

interface Notebook {
  id: string;
  title: string;
  created_at: string;
}

export const Notebook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, title: "", message: "", type: "info" });
  const navigate = useNavigate();


  useEffect(() => {
    if (id) {
      loadNotebookData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadNotebookData = async () => {
    try {
      setLoading(true);
      const { data: notebookData, error: notebookError } = await supabase
        .from("notebooks")
        .select("*")
        .eq("id", id)
        .single();

      if (notebookError) throw notebookError;

      const { data: whiteboardsData, error: whiteboardsError } = await supabase
        .from("whiteboards")
        .select("*")
        .eq("notebook_id", id)
        .order("order_index", { ascending: true });

      if (whiteboardsError) throw whiteboardsError;

      setNotebook(notebookData);
      setWhiteboards(whiteboardsData || []);
    } catch (error) {
      console.error("Error loading notebook data:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to load notebook data. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWhiteboard = async () => {
    if (!newBoardTitle.trim()) {
      setAlert({
        show: true,
        title: "Invalid Title",
        message: "Please enter a title for your whiteboard.",
        type: "warning",
      });
      return;
    }

    if (!user) {
      setAlert({
        show: true,
        title: "Authentication Error",
        message: "You must be logged in to create a whiteboard.",
        type: "error",
      });
      return;
    }

    try {
      const maxOrderIndex = Math.max(
        ...whiteboards.map((w) => w.order_index),
        -1
      );
      // checking errors hence data is removed as not used
      const { error } = await supabase
        .from("whiteboards")
        .insert([
          {
            title: newBoardTitle.trim(),
            user_id: user.id,
            notebook_id: id,
            order_index: maxOrderIndex + 1,
            drawing_data: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowNewBoardDialog(false);
      setNewBoardTitle("");
      loadNotebookData();
    } catch (error) {
      console.error("Error creating whiteboard:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to create whiteboard. Please try again.",
        type: "error",
      });
    }
  };

  const deleteWhiteboard = async (whiteboardId: string) => {
    try {
      const { error } = await supabase
        .from("whiteboards")
        .delete()
        .eq("id", whiteboardId);

      if (error) throw error;
      loadNotebookData();
    } catch (error) {
      console.error("Error deleting whiteboard:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to delete whiteboard. Please try again.",
        type: "error",
      });
    }
  };

  const moveWhiteboard = async (
    whiteboardId: string,
    direction: "up" | "down"
  ) => {
    try {
      const currentIndex = whiteboards.findIndex((w) => w.id === whiteboardId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= whiteboards.length) return;

      const updatedWhiteboards = [...whiteboards];
      const temp = updatedWhiteboards[currentIndex];
      updatedWhiteboards[currentIndex] = updatedWhiteboards[newIndex];
      updatedWhiteboards[newIndex] = temp;

      // Update order_index while preserving all other fields
      const updates = updatedWhiteboards.map((w, index) => ({
        id: w.id,
        user_id: w.user_id,
        notebook_id: w.notebook_id,
        title: w.title,
        drawing_data: w.drawing_data,
        order_index: index,
      }));

      const { error } = await supabase.from("whiteboards").upsert(updates, {
        onConflict: "id",
      });

      if (error) throw error;
      loadNotebookData();
    } catch (error) {
      console.error("Error reordering whiteboards:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to reorder whiteboards. Please try again.",
        type: "error",
      });
    }
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
          <p className="mt-6 text-xl text-gray-100">Loading Notebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Left group: Back button + Title */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              {notebook?.title}
            </h1>
          </div>

          {/* Right group: Action buttons */}
          <div className="flex flex-col mt-4 gap-4 md:mt-0 md:flex-row md:gap-4">
            <Button
              variant="outline"
              onClick={() => setReordering(!reordering)}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                reordering
                  ? "bg-purple-900/30 text-purple-300 border-purple-700"
                  : "border-gray-700 text-gray-900"
              }`}
            >
              <MoveVertical className="w-5 h-5" />
              {reordering ? "Done Reordering" : "Reorder Whiteboards"}
            </Button>
            <Button
              onClick={() => setShowNewBoardDialog(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Whiteboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whiteboards.map((whiteboard, index) => (
            <div
              key={whiteboard.id}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-100">
                    {whiteboard.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {reordering ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveWhiteboard(whiteboard.id, "up")}
                          disabled={index === 0}
                          className={`p-1 rounded-full ${
                            index === 0
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-purple-400 hover:bg-gray-800"
                          }`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveWhiteboard(whiteboard.id, "down")}
                          disabled={index === whiteboards.length - 1}
                          className={`p-1 rounded-full ${
                            index === whiteboards.length - 1
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-purple-400 hover:bg-gray-800"
                          }`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(
                              `/whiteboard?id=${
                                whiteboard.id
                              }&title=${encodeURIComponent(whiteboard.title)}`
                            )
                          }
                          className="text-purple-400 hover:text-purple-300 hover:bg-gray-800"
                        >
                          <PencilRuler className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWhiteboard(whiteboard.id)}
                          className="text-gray-400 hover:text-red-400 hover:bg-gray-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>
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

        {showNewBoardDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-medium text-gray-100 mb-4">
                Add New Whiteboard
              </h3>
              <Input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Enter whiteboard title"
                className="w-full px-3 py-2 bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-purple-500 focus:border-purple-500 mb-6"
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewBoardDialog(false);
                    setNewBoardTitle("");
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWhiteboard}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        <AlertDialog
          isOpen={alert.show}
          onClose={() => setAlert({ ...alert, show: false })}
          title={alert.title}
          message={alert.message}
          type={alert.type}
        />
      </div>
    </div>
  );
};
