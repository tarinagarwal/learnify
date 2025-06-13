"use client";

import { Copy, Download, Maximize, Minimize, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  drawingData: unknown[];
  response?: string;
}

export const ResponseDialog: React.FC<ResponseDialogProps> = ({
  isOpen,
  onClose,
  drawingData,
  response,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !drawingData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set theme-aware background
    ctx.fillStyle = "hsl(var(--muted))";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    if (Array.isArray(drawingData)) {
      drawingData.forEach((path) => {
        if (!path || !Array.isArray(path.points) || path.points.length < 2)
          return;

        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        path.points.slice(1).forEach((point: unknown) => {
          if (typeof point.x === "number" && typeof point.y === "number") {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.strokeStyle = path.color || "#000000";
        ctx.lineWidth = path.width || 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      });
    }
  }, [isOpen, drawingData]);

  // Handle escape key to exit fullscreen or close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fullscreen) {
          setFullscreen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [fullscreen, isOpen, onClose]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "whiteboard-snapshot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopyResponse = () => {
    if (!response) return;

    navigator.clipboard
      .writeText(response)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  if (!isOpen) return null;

  // Process the response text to fix markdown formatting
  const processedResponse = response?.replace(
    /#{1,3}([^#\n]+)/g,
    (match, content) => {
      const level = match.startsWith("###")
        ? "### "
        : match.startsWith("##")
        ? "## "
        : "# ";
      return `\n${level}${content.trim()}\n`;
    }
  );

  return (
    <div
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 ${
        fullscreen ? "p-0" : "p-4"
      }`}
    >
      <div
        ref={dialogRef}
        className={`bg-card/90 backdrop-blur-sm border border-border rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${
          fullscreen
            ? "fixed inset-0 w-full h-full rounded-none"
            : "max-w-4xl w-full max-h-[90vh]"
        }`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card/50">
          <h3 className="text-xl font-medium text-card-foreground">AI Analysis</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
              title="Download snapshot"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleCopyResponse}
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
              title={copied ? "Copied!" : "Copy analysis"}
            >
              <Copy className="w-5 h-5" />
              {copied && (
                <span className="absolute bg-card border border-border text-card-foreground text-xs px-2 py-1 rounded -bottom-8 left-1/2 transform -translate-x-1/2 shadow-lg z-10">
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className={`${
            fullscreen ? "h-[calc(100vh-64px)]" : "max-h-[70vh]"
          } overflow-auto`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Drawing Canvas */}
            <div className="relative bg-muted rounded-lg shadow-md overflow-hidden h-[300px] md:h-auto border border-border">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Analysis Content */}
            <div className="prose prose-invert max-w-none overflow-y-auto bg-muted/50 rounded-lg p-4 max-h-[300px] md:max-h-[calc(70vh-100px)] custom-scrollbar border border-border">
              {processedResponse ? (
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-border text-card-foreground">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mb-3 text-card-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mb-2 text-card-foreground">{children}</h3>
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
                    em: ({ children }) => (
                      <em className="italic text-accent-foreground">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r-lg">
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
                          <code className="bg-muted border border-border rounded px-1 py-0.5 text-sm font-mono text-primary">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre className="bg-muted border border-border rounded-md p-4 my-4 overflow-x-auto">
                          <code className="text-sm font-mono text-foreground">{children}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {processedResponse}
                </ReactMarkdown>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg">
                    No analysis available
                  </div>
                  <p className="text-muted-foreground/60 mt-2">
                    The AI hasn't generated a response yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.5);
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
