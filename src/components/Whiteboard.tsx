import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Eraser,
  History,
  MessageSquare,
  Minus,
  Palette,
  Plus,
  Save,
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
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [whiteboards, setWhiteboards] = useState<any[]>([]);

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

  // handle key press to navigate to next and previous page
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
          newDrawingData.pop();
          clearDrawing();
          newDrawingData.forEach((stroke) => {
            addStroke(stroke);
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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

    canvas.addEventListener("touchstart", startDrawing as any);
    canvas.addEventListener("touchmove", draw as any);
    canvas.addEventListener("touchend", endDrawing);
    canvas.addEventListener("pointerdown", startDrawing as any);
    canvas.addEventListener("pointermove", draw as any);
    canvas.addEventListener("pointerup", endDrawing);
    canvas.addEventListener("pointerout", endDrawing);
    canvas.addEventListener("touchstart", (e) => e.preventDefault());
    canvas.addEventListener("touchmove", (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener("touchstart", startDrawing as any);
      canvas.removeEventListener("touchmove", draw as any);
      canvas.removeEventListener("touchend", endDrawing);
      canvas.removeEventListener("pointerdown", startDrawing as any);
      canvas.removeEventListener("pointermove", draw as any);
      canvas.removeEventListener("pointerup", endDrawing);
      canvas.removeEventListener("pointerout", endDrawing);
    };
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
    ctx.fillStyle = "white";
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
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex justify-between items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-purple-400"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              {decodeURIComponent(whiteboardTitle || "")}
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={clearDrawing}
              className="flex items-center gap-2 border-gray-700 text-gray-900"
              disabled={loading}
            >
              <Eraser className="w-4 h-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowResponseHistory(true)}
              className="flex items-center gap-2 border-gray-700 text-gray-900"
            >
              <History className="w-4 h-4" />
              Response History
            </Button>
            <Button
              variant="outline"
              onClick={downloadCanvas}
              className="flex items-center gap-2 border-gray-700 text-gray-900"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              onClick={getAIResponse}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              <MessageSquare className="w-4 h-4" />
              Get AI Response
            </Button>
            <Button
              onClick={saveWhiteboard}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 mb-6">
          <div className="mb-6 flex flex-wrap items-center gap-4 md:justify-between">
            <div className="flex items-center gap-2 bg-gray-800 py-2 rounded-lg ">
              <Palette className="w-5 h-5 text-purple-400" />
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      currentColor === color
                        ? "scale-125 ring-2 ring-purple-500"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-6 h-6 rounded-full cursor-pointer bg-transparent"
                  aria-label="Custom color picker"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
              <button
                onClick={() => setCurrentWidth(Math.max(1, currentWidth - 1))}
                className="text-gray-400 hover:text-purple-400 p-1"
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
                className="w-32 accent-purple-500"
              />
              <button
                onClick={() => setCurrentWidth(Math.min(20, currentWidth + 1))}
                className="text-gray-400 hover:text-purple-400 p-1"
                disabled={currentWidth >= 20}
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-300 min-w-[24px] text-center">
                {currentWidth}px
              </span>
            </div>

            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
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
                className="flex items-center gap-2 border-gray-700 text-gray-900"
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
              <span className="text-gray-300 px-2">
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
                className="flex items-center gap-2 border-gray-700 text-gray-900"
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
            <div className="absolute inset-0 bg-gray-800 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]"></div>

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

      {showResponseHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-w-4xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-100">
                AI Response History
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResponseHistory(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {aiResponses.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-300">No responses yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Use the "Get AI Response" button to analyze your drawing
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {aiResponses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm text-gray-400">
                          {new Date(response.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {response.drawing_data && (
                          <div className="relative w-full aspect-[4/3] bg-white rounded-lg shadow-md overflow-hidden">
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
                                <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-700">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-xl font-semibold mb-3">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-lg font-semibold mb-2">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-4 leading-relaxed text-gray-300">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-purple-400">
                                  {children}
                                </strong>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4 text-gray-300">
                                  {children}
                                </blockquote>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 space-y-1 mb-4 text-gray-300">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 space-y-1 mb-4 text-gray-300">
                                  {children}
                                </ol>
                              ),
                              code: ({ inline, children }) => {
                                if (inline) {
                                  return (
                                    <code className="bg-gray-800 rounded px-1 py-0.5 text-sm font-mono text-purple-300">
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <pre className="bg-gray-800 rounded-md p-4 my-4 overflow-x-auto">
                                    <code className="text-sm font-mono">
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};
