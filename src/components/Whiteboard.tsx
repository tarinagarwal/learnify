import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Eraser,
  History,
  Info,
  Keyboard,
  MessageSquare,
  Minus,
  Palette,
  Plus,
  Redo,
  Save,
  Undo,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generateResponse } from "../services/groq";
import { useBlackboardStore } from "../store/blackboardStore";
import { AlertDialog } from "./AlertDialog";
import { ResponseDialog } from "./ResponseDialog";

interface Point {
  x: number;
  y: number;
}

interface DrawingData {
  points: Point[];
  color: string;
  width: number;
}

interface AIResponse {
  id: string;
  response_text: string;
  created_at: string;
  drawing_data?: DrawingData[];
}

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [currentWidth, setCurrentWidth] = useState(2);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const { drawingData, addStroke, clearDrawing } = useBlackboardStore();
  const [undoHistory, setUndoHistory] = useState<DrawingData[]>([]);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, title: "", message: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const [showResponseHistory, setShowResponseHistory] = useState(false);
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showShortcutsCard, setShowShortcutsCard] = useState(false);

  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [whiteboards, setWhiteboards] = useState<unknown[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const whiteboardId = searchParams.get("id");
  const whiteboardTitle = searchParams.get("title");

  useEffect(() => {
    if (!whiteboardId) {
      navigate("/dashboard");
      return;
    }

    loadWhiteboardData();
    loadAIResponses();
    if (notebookId) {
      loadNotebookWhiteboards(notebookId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whiteboardId, navigate, notebookId]);

  const loadWhiteboardData = async () => {
    if (!whiteboardId) return;

    try {
      const { data, error } = await supabase
        .from("whiteboards")
        .select("*")
        .eq("id", whiteboardId)
        .single();

      if (error) throw error;
      if (data) {
        setNotebookId(data.notebook_id);
        clearDrawing();
        data.drawing_data.forEach((stroke: DrawingData) => {
          addStroke(stroke);
        });
      }
    } catch (error) {
      console.error("Error loading whiteboard data:", error);
    }
  };

  const loadNotebookWhiteboards = async (notebookId: string) => {
    try {
      const { data, error } = await supabase
        .from("whiteboards")
        .select("*")
        .eq("notebook_id", notebookId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setWhiteboards(data || []);
    } catch (error) {
      console.error("Error loading notebook whiteboards:", error);
    }
  };

  const loadAIResponses = async () => {
    if (!whiteboardId) return;

    try {
      const { data, error } = await supabase
        .from("ai_responses")
        .select("*")
        .eq("whiteboard_id", whiteboardId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAiResponses(data || []);
    } catch (error) {
      console.error("Error loading AI responses:", error);
    }
  };

  // Handle key press to navigate to next and previous page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        loading
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        // Navigate to previous whiteboard
        if (
          whiteboards.length > 0 &&
          whiteboards.findIndex((wb) => wb.id === whiteboardId) > 0 &&
          !loading
        ) {
          const currentIndex = whiteboards.findIndex(
            (wb) => wb.id === whiteboardId
          );
          if (currentIndex > 0) {
            e.preventDefault();
            saveWhiteboard();
            const prevWhiteboard = whiteboards[currentIndex - 1];
            navigate(
              `/whiteboard?id=${prevWhiteboard.id}&title=${encodeURIComponent(
                prevWhiteboard.title
              )}${
                searchParams.get("notebook_id")
                  ? `&notebook_id=${searchParams.get("notebook_id")}`
                  : ""
              }`
            );
          }
        }
      } else if (e.key === "ArrowRight") {
        // Navigate to next whiteboard
        if (
          whiteboards.length > 0 &&
          whiteboards.findIndex((wb) => wb.id === whiteboardId) <
            whiteboards.length - 1 &&
          !loading
        ) {
          const currentIndex = whiteboards.findIndex(
            (wb) => wb.id === whiteboardId
          );
          if (currentIndex < whiteboards.length - 1) {
            e.preventDefault();
            saveWhiteboard();
            const nextWhiteboard = whiteboards[currentIndex + 1];
            navigate(
              `/whiteboard?id=${nextWhiteboard.id}&title=${encodeURIComponent(
                nextWhiteboard.title
              )}${
                searchParams.get("notebook_id")
                  ? `&notebook_id=${searchParams.get("notebook_id")}`
                  : ""
              }`
            );
          }
        }
      }
      // Handle Ctrl+Z / Cmd+Z for undo last stroke
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (drawingData.length > 0) {
          const newDrawingData = [...drawingData];
          const lastStroke = newDrawingData.pop();
          if (lastStroke) {
            setUndoHistory((prev) => [...prev, lastStroke]);
          }
          clearDrawing();
          newDrawingData.forEach((stroke) => {
            addStroke(stroke);
          });
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        // Handle Ctrl+Y / Cmd+Y for redo
        if (undoHistory.length > 0) {
          e.preventDefault();
          const newUndoHistory = [...undoHistory];
          const strokeToRestore = newUndoHistory.pop();
          if (strokeToRestore) {
            addStroke(strokeToRestore);
            setUndoHistory(newUndoHistory);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whiteboards, whiteboardId, loading, navigate, searchParams]);

  const getPointFromEvent = (
    e: React.MouseEvent | React.TouchEvent | PointerEvent,
    canvas: HTMLCanvasElement
  ): Point | null => {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in e) {
      const touch = e.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else if ("clientX" in e) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      return null;
    }

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getPointFromEvent(e, canvas);
    if (!point) return;

    setIsDrawing(true);
    setCurrentPoints([point]);

    if ("touches" in e) {
      e.preventDefault();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getPointFromEvent(e, canvas);
    if (!point) return;

    setCurrentPoints((prev) => [...prev, point]);

    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentPoints.length > 0) {
      const lastPoint = currentPoints[currentPoints.length - 1];
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    if ("touches" in e) {
      e.preventDefault();
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentPoints.length > 1) {
      addStroke({
        points: currentPoints,
        color: currentColor,
        width: currentWidth,
      });
      // Clear the undo history when a new stroke is added
      setUndoHistory([]);
    }
    setCurrentPoints([]);
  };

  const saveWhiteboard = async () => {
    if (!whiteboardId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("whiteboards")
        .update({ drawing_data: drawingData })
        .eq("id", whiteboardId);

      if (error) throw error;

      setUndoHistory([]);

      setAlert({
        show: true,
        title: "Success",
        message: "Whiteboard saved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving whiteboard:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to save whiteboard. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAIResponse = async () => {
    if (!canvasRef.current || !whiteboardId) return;

    try {
      setLoading(true);
      const canvas = canvasRef.current;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);

      const imageData = tempCanvas.toDataURL("image/png");
      const response = await generateResponse(imageData);

      const { error } = await supabase.from("ai_responses").insert([
        {
          whiteboard_id: whiteboardId,
          response_text: response,
          drawing_data: drawingData,
        },
      ]);

      if (error) throw error;

      await loadAIResponses();
      setCurrentResponse(response);
      setShowResponseDialog(true);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to get AI response. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = `${whiteboardTitle || "whiteboard"}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  const colorOptions = [
    "#f87171",
    "#fb923c",
    "#facc15",
    "#4ade80",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("touchstart", startDrawing as unknown);
    canvas.addEventListener("touchmove", draw as unknown);
    canvas.addEventListener("touchend", endDrawing);
    canvas.addEventListener("pointerdown", startDrawing as unknown);
    canvas.addEventListener("pointermove", draw as unknown);
    canvas.addEventListener("pointerup", endDrawing);
    canvas.addEventListener("pointerout", endDrawing);
    canvas.addEventListener("touchstart", (e) => e.preventDefault());
    canvas.addEventListener("touchmove", (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener("touchstart", startDrawing as unknown);
      canvas.removeEventListener("touchmove", draw as unknown);
      canvas.removeEventListener("touchend", endDrawing);
      canvas.removeEventListener("pointerdown", startDrawing as unknown);
      canvas.removeEventListener("pointermove", draw as unknown);
      canvas.removeEventListener("pointerup", endDrawing);
      canvas.removeEventListener("pointerout", endDrawing);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing, currentColor, currentWidth, currentPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawingData.forEach((stroke) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      stroke.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });
  }, [drawingData]);

  const renderCanvas = (
    canvasElement: HTMLCanvasElement,
    data: DrawingData[]
  ) => {
    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = "hsl(var(--muted))";
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    data.forEach((path) => {
      if (!path.points || path.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = path.color || "#000000";
      ctx.lineWidth = path.width || 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    });
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
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex justify-between items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
              {decodeURIComponent(whiteboardTitle || "")}
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowShortcutsCard(true)}
              className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4" />
              Shortcuts
            </Button>
            <Button
              variant="outline"
              onClick={clearDrawing}
              className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
              disabled={loading}
            >
              <Eraser className="w-4 h-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowResponseHistory(true)}
              className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
            >
              <History className="w-4 h-4" />
              Response History
            </Button>
            <Button
              variant="outline"
              onClick={downloadCanvas}
              className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              onClick={getAIResponse}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              <MessageSquare className="w-4 h-4" />
              Get AI Response
            </Button>
            <Button
              onClick={saveWhiteboard}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border p-6 mb-6">
          <div className="mb-6 flex flex-wrap items-center gap-4 md:justify-between">
            <div className="flex items-center gap-2 bg-muted/50 py-2 px-4 rounded-lg border border-border">
              <Palette className="w-5 h-5 text-primary" />
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform border-2 ${
                      currentColor === color
                        ? "scale-125 ring-2 ring-primary border-primary"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-2 border-border"
                  aria-label="Custom color picker"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border">
              <button
                onClick={() => setCurrentWidth(Math.max(1, currentWidth - 1))}
                className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted transition-colors"
                disabled={currentWidth <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="1"
                max="20"
                value={currentWidth}
                onChange={(e) =>
                  setCurrentWidth(Number.parseInt(e.target.value))
                }
                className="w-32 accent-primary"
              />
              <button
                onClick={() => setCurrentWidth(Math.min(20, currentWidth + 1))}
                className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted transition-colors"
                disabled={currentWidth >= 20}
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-foreground min-w-[24px] text-center font-medium">
                {currentWidth}px
              </span>
            </div>

            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (drawingData.length > 0) {
                    const newDrawingData = [...drawingData];
                    const lastStroke = newDrawingData.pop();
                    if (lastStroke) {
                      setUndoHistory((prev) => [...prev, lastStroke]);
                    }
                    clearDrawing();
                    newDrawingData.forEach((stroke) => {
                      addStroke(stroke);
                    });
                  }
                }}
                className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
                disabled={drawingData.length === 0}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (undoHistory.length > 0) {
                    const newUndoHistory = [...undoHistory];
                    const strokeToRestore = newUndoHistory.pop();
                    if (strokeToRestore) {
                      addStroke(strokeToRestore);
                      setUndoHistory(newUndoHistory);
                    }
                  }
                }}
                className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
                disabled={undoHistory.length === 0}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  saveWhiteboard();
                  if (whiteboards.length > 0) {
                    const currentIndex = whiteboards.findIndex(
                      (wb) => wb.title === whiteboardTitle
                    );
                    if (currentIndex > 0) {
                      const prevWhiteboard = whiteboards[currentIndex - 1];
                      navigate(
                        `/whiteboard?id=${
                          prevWhiteboard.id
                        }&title=${encodeURIComponent(prevWhiteboard.title)}${
                          searchParams.get("notebook_id")
                            ? `&notebook_id=${searchParams.get("notebook_id")}`
                            : ""
                        }`
                      );
                    }
                  }
                }}
                className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
                disabled={
                  whiteboards.findIndex((wb) => wb.title === whiteboardTitle) <=
                    0 ||
                  loading ||
                  whiteboards.length === 0
                }
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-foreground px-2 font-medium">
                {whiteboardTitle || "Whiteboard"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Save current canvas and navigate to next whiteboard
                  saveWhiteboard();
                  if (whiteboards.length > 0) {
                    const currentIndex = whiteboards.findIndex(
                      (wb) => wb.id === whiteboardId
                    );
                    if (currentIndex < whiteboards.length - 1) {
                      const nextWhiteboard = whiteboards[currentIndex + 1];
                      navigate(
                        `/whiteboard?id=${
                          nextWhiteboard.id
                        }&title=${encodeURIComponent(nextWhiteboard.title)}${
                          searchParams.get("notebook_id")
                            ? `&notebook_id=${searchParams.get("notebook_id")}`
                            : ""
                        }`
                      );
                    }
                  }
                }}
                className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
                disabled={
                  whiteboards.findIndex((wb) => wb.id === whiteboardId) >=
                    whiteboards.length - 1 ||
                  loading ||
                  whiteboards.length === 0
                }
              >
                Next
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-muted bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <canvas
              ref={canvasRef}
              className="w-full h-[600px] relative z-10 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              style={{ touchAction: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      {showShortcutsCard && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium text-card-foreground">
                  Keyboard Shortcuts
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcutsCard(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <h4 className="text-sm font-medium text-primary mb-2">
                    Navigation
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-foreground">Previous Page</span>
                      <kbd className="px-2 py-1 bg-card rounded text-xs text-muted-foreground border border-border">
                        ←
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-foreground">Next Page</span>
                      <kbd className="px-2 py-1 bg-card rounded text-xs text-muted-foreground border border-border">
                        →
                      </kbd>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <h4 className="text-sm font-medium text-primary mb-2">
                    Editing
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-foreground">Undo</span>
                      <kbd className="px-2 py-1 bg-card rounded text-xs text-muted-foreground border border-border">
                        Ctrl+Z
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-foreground">Redo</span>
                      <kbd className="px-2 py-1 bg-card rounded text-xs text-muted-foreground border border-border">
                        Ctrl+Y
                      </kbd>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Info className="w-3 h-3" />
                  <span>Tips:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Arrow keys navigate between pages while automatically saving
                    your work
                  </li>
                  <li>
                    Keyboard shortcuts won't work when typing in text fields
                  </li>
                  <li>For Mac users, use Command (⌘) instead of Ctrl</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResponseHistory && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-4xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-card-foreground">
                AI Response History
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResponseHistory(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {aiResponses.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-foreground">No responses yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use the "Get AI Response" button to analyze your drawing
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {aiResponses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-muted/50 rounded-lg p-6 border border-border"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(response.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {response.drawing_data && (
                          <div className="relative w-full aspect-[4/3] bg-card rounded-lg shadow-md overflow-hidden border border-border">
                            <canvas
                              width={800}
                              height={600}
                              className="w-full h-full"
                              ref={(canvas) => {
                                if (canvas && response.drawing_data) {
                                  renderCanvas(canvas, response.drawing_data);
                                }
                              }}
                            />
                          </div>
                        )}
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-border text-card-foreground">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-xl font-semibold mb-3 text-card-foreground">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-4 leading-relaxed text-foreground">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-primary">
                                  {children}
                                </strong>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                                  {children}
                                </blockquote>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 space-y-1 mb-4 text-foreground">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 space-y-1 mb-4 text-foreground">
                                  {children}
                                </ol>
                              ),
                              code: ({ inline, children }) => {
                                if (inline) {
                                  return (
                                    <code className="bg-muted rounded px-1 py-0.5 text-sm font-mono text-primary">
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <pre className="bg-muted rounded-md p-4 my-4 overflow-x-auto border border-border">
                                    <code className="text-sm font-mono text-foreground">
                                      {children}
                                    </code>
                                  </pre>
                                );
                              },
                            }}
                          >
                            {response.response_text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      <ResponseDialog
        isOpen={showResponseDialog}
        onClose={() => setShowResponseDialog(false)}
        drawingData={drawingData}
        response={currentResponse}
      />

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

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.7);
        }
      `}</style>
    </div>
  );
};
