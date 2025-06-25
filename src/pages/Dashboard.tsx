"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Trash2,
  PencilRuler,
  MessageSquare,
  Book,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { AlertDialog } from "../components/AlertDialog";
import { useAuthStore } from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Translate } from "../components/Translate";

interface DashboardStats {
  totalWhiteboards: number;
  totalResponses: number;
  totalNotebooks: number;
  totalNotebookPages: number;
}

interface Whiteboard {
  id: string;
  title: string;
  created_at: string;
  drawing_data: unknown[];
}

interface Notebook {
  id: string;
  title: string;
  created_at: string;
  whiteboards: {
    id: string;
  }[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalWhiteboards: 0,
    totalResponses: 0,
    totalNotebooks: 0,
    totalNotebookPages: 0,
  });
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [showNewNotebookDialog, setShowNewNotebookDialog] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [newNotebookSize, setNewNotebookSize] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, title: "", message: "", type: "info" });
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: whiteboardsData, error: whiteboardsError } = await supabase
        .from("whiteboards")
        .select("*")
        .is("notebook_id", null)
        .order("created_at", { ascending: false });

      if (whiteboardsError) throw whiteboardsError;

      const { data: notebooksData, error: notebooksError } = await supabase
        .from("notebooks")
        .select(
          `
          *,
          whiteboards (
            id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (notebooksError) throw notebooksError;

      const { count: responsesCount, error: responsesError } = await supabase
        .from("ai_responses")
        .select("*", { count: "exact", head: true });

      if (responsesError) throw responsesError;

      const totalNotebookPages =
        notebooksData?.reduce(
          (acc, nb) => acc + (nb.whiteboards?.length || 0),
          0
        ) || 0;

      setWhiteboards(whiteboardsData || []);
      setNotebooks(notebooksData || []);
      setStats({
        totalWhiteboards: whiteboardsData?.length || 0,
        totalResponses: responsesCount || 0,
        totalNotebooks: notebooksData?.length || 0,
        totalNotebookPages,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to load dashboard data. Please try again.",
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
      const { data, error } = await supabase
        .from("whiteboards")
        .insert([
          {
            title: newBoardTitle.trim(),
            user_id: user.id,
            drawing_data: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowNewBoardDialog(false);
      setNewBoardTitle("");
      navigate(
        `/whiteboard?id=${data.id}&title=${encodeURIComponent(data.title)}`
      );
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

  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) {
      setAlert({
        show: true,
        title: "Invalid Title",
        message: "Please enter a title for your notebook.",
        type: "warning",
      });
      return;
    }

    if (!user) {
      setAlert({
        show: true,
        title: "Authentication Error",
        message: "You must be logged in to create a notebook.",
        type: "error",
      });
      return;
    }

    try {
      const { data: notebook, error: notebookError } = await supabase
        .from("notebooks")
        .insert([
          {
            title: newNotebookTitle.trim(),
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (notebookError) throw notebookError;

      // Create initial whiteboards
      const whiteboards = Array.from({ length: newNotebookSize }, (_, i) => ({
        title: `Page ${i + 1}`,
        user_id: user.id,
        notebook_id: notebook.id,
        order_index: i,
        drawing_data: [],
      }));

      const { error: whiteboardsError } = await supabase
        .from("whiteboards")
        .insert(whiteboards);

      if (whiteboardsError) throw whiteboardsError;

      setShowNewNotebookDialog(false);
      setNewNotebookTitle("");
      setNewNotebookSize(5);
      navigate(`/notebook/${notebook.id}`);
    } catch (error) {
      console.error("Error creating notebook:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to create notebook. Please try again.",
        type: "error",
      });
    }
  };

  const deleteWhiteboard = async (id: string) => {
    try {
      const { error } = await supabase
        .from("whiteboards")
        .delete()
        .eq("id", id);

      if (error) throw error;
      loadDashboardData();
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

  const deleteNotebook = async (id: string) => {
    try {
      const { error } = await supabase.from("notebooks").delete().eq("id", id);

      if (error) throw error;
      loadDashboardData();
    } catch (error) {
      console.error("Error deleting notebook:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to delete notebook. Please try again.",
        type: "error",
      });
    }
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
          <p className="mt-6 text-xl text-foreground">Loading Dashboard...</p>
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
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
              <Translate>Dashboard</Translate>
            </h2>
            <p className="mt-2 text-xl text-muted-foreground">
              <Translate>
                Manage your notebooks, whiteboards, and track your learning
                progress here.
              </Translate>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <PencilRuler className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-card-foreground">
                  <Translate>Individual Whiteboards</Translate>
                </h3>
              </div>
              <p className="text-3xl font-bold text-card-foreground">
                {stats.totalWhiteboards}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <Book className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-card-foreground">
                  <Translate>Notebooks</Translate>
                </h3>
              </div>
              <p className="text-3xl font-bold text-card-foreground">
                {stats.totalNotebooks}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-card-foreground">
                  <Translate>Notebook Pages</Translate>
                </h3>
              </div>
              <p className="text-3xl font-bold text-card-foreground">
                {stats.totalNotebookPages}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-card-foreground">
                  <Translate>AI Responses</Translate>
                </h3>
              </div>
              <p className="text-3xl font-bold text-card-foreground">
                {stats.totalResponses}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notebooks Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              <Translate>Your Notebooks</Translate>
            </h2>
            <Button
              onClick={() => setShowNewNotebookDialog(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-5 h-5" />
              <Translate>Create New Notebook</Translate>
            </Button>
          </div>

          {notebooks.length === 0 ? (
            <Card className="text-center p-8 bg-card/50 backdrop-blur-sm border-border">
              <CardContent>
                <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-card-foreground">
                  <Translate>No notebooks yet</Translate>
                </p>
                <p className="mt-2 text-muted-foreground">
                  <Translate>
                    Create your first notebook to get started
                  </Translate>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notebooks.map((notebook) => (
                <div
                  key={notebook.id}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-card-foreground">
                        {notebook.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/notebook/${notebook.id}`)}
                          className="text-primary hover:text-primary/80 hover:bg-muted"
                        >
                          <Book className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotebook(notebook.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-muted"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      <Translate>Created:</Translate>{" "}
                      {new Date(notebook.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-grow bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(
                              100,
                              ((notebook.whiteboards?.length || 0) / 10) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {notebook.whiteboards?.length || 0}{" "}
                        <Translate>pages</Translate>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Whiteboards Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              <Translate>Your Whiteboards</Translate>
            </h2>
            <Button
              onClick={() => setShowNewBoardDialog(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-5 h-5" />
              <Translate>Create New Whiteboard</Translate>
            </Button>
          </div>

          {whiteboards.length === 0 ? (
            <Card className="text-center p-8 bg-card/50 backdrop-blur-sm border-border">
              <CardContent>
                <PencilRuler className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-card-foreground">
                  <Translate>No whiteboards yet</Translate>
                </p>
                <p className="mt-2 text-muted-foreground">
                  <Translate>
                    Create your first whiteboard to get started
                  </Translate>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-card-foreground">
                        {whiteboard.title}
                      </h3>
                      <div className="flex items-center gap-2">
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
                          className="text-primary hover:text-primary/80 hover:bg-muted"
                        >
                          <PencilRuler className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWhiteboard(whiteboard.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-muted"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      <Translate>Created:</Translate>{" "}
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
                        {whiteboard.drawing_data.length}{" "}
                        <Translate>strokes</Translate>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Whiteboard Dialog */}
        {showNewBoardDialog && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-medium text-card-foreground mb-4">
                <Translate>Create New Whiteboard</Translate>
              </h3>
              <Input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Enter whiteboard title"
                className="w-full px-3 py-2 bg-input border-border text-foreground focus:ring-primary focus:border-primary mb-6"
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewBoardDialog(false);
                    setNewBoardTitle("");
                  }}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  <Translate>Cancel</Translate>
                </Button>
                <Button
                  onClick={handleCreateWhiteboard}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Translate>Create</Translate>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New Notebook Dialog */}
        {showNewNotebookDialog && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-medium text-card-foreground mb-4">
                <Translate>Create New Notebook</Translate>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    <Translate>Notebook Title</Translate>
                  </label>
                  <Input
                    type="text"
                    value={newNotebookTitle}
                    onChange={(e) => setNewNotebookTitle(e.target.value)}
                    placeholder="Enter notebook title"
                    className="w-full px-3 py-2 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    <Translate>Number of Pages (max 25)</Translate>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="25"
                    value={newNotebookSize}
                    onChange={(e) =>
                      setNewNotebookSize(
                        Math.min(
                          25,
                          Math.max(1, Number.parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-full px-3 py-2 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewNotebookDialog(false);
                    setNewNotebookTitle("");
                    setNewNotebookSize(5);
                  }}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  <Translate>Cancel</Translate>
                </Button>
                <Button
                  onClick={handleCreateNotebook}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Translate>Create</Translate>
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
