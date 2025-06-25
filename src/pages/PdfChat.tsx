"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Upload, Loader2, FileText } from "lucide-react";
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import { generatePdfChat } from "../services/groq";
import ReactMarkdown from "react-markdown";
import "pdfjs-dist/build/pdf.worker.mjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Translate } from "../components/Translate";

// Set worker path
// @ts-expect-error: Setting workerSrc directly may not be recognized by TypeScript typings of pdfjsLib
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PdfChat() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfText, setPdfText] = useState<string>("");
  const [pdfName, setPdfName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedPdfContent = sessionStorage.getItem("pdfContent");
    const storedPdfUrl = sessionStorage.getItem("pdfUrl");
    const storedPdfName = sessionStorage.getItem("pdfName");

    if (storedPdfContent && storedPdfUrl) {
      setPdfText(storedPdfContent);
      setPdfUrl(storedPdfUrl);
      setPdfName(storedPdfName || "Uploaded PDF");

      setMessages([
        {
          role: "assistant",
          content: `I've loaded "${
            storedPdfName || "your PDF"
          }". You can now ask questions about its content.`,
        },
      ]);

      sessionStorage.removeItem("pdfContent");
      sessionStorage.removeItem("pdfUrl");
      sessionStorage.removeItem("pdfName");
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please upload a valid PDF file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setPdfName(file.name);

      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);

      const arrayBuffer = await file.arrayBuffer();
      const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer })
        .promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => item.str)
          .join(" ");
        fullText += pageText + " ";
      }

      setPdfText(fullText);
      await pdf.destroy();

      toast({
        title: "Success",
        description:
          "PDF uploaded successfully. You can now ask questions about its content.",
      });
      setMessages([
        {
          role: "assistant",
          content: `I've loaded "${file.name}". You can now ask questions about its content.`,
        },
      ]);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Error",
        description: "Error processing PDF. Please try uploading again.",
        variant: "destructive",
      });
      setPdfUrl("");
      setPdfText("");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !pdfText) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await generatePdfChat(pdfText, userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
              <MessageSquare className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
              <Translate>PDF Chat</Translate>
            </h2>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload a PDF and ask questions about its content
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* PDF Preview */}
          <Card className="lg:w-1/2 bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-card-foreground flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                {pdfName || "PDF Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!pdfUrl ? (
                <div className="flex flex-col items-center justify-center min-h-[600px] bg-muted/50 rounded-lg border border-dashed border-border p-8">
                  <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-foreground text-lg mb-2">
                    Upload your PDF to get started
                  </p>
                  <p className="text-muted-foreground text-sm mb-6 text-center">
                    Drag and drop your file here or click the button below
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-4 border-primary text-primary hover:bg-primary/10"
                    onClick={handleUploadClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        <Translate>Upload PDF</Translate>
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </div>
              ) : (
                <div className="h-[600px]">
                  {uploading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full rounded-md bg-white"
                      title="PDF Preview"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:w-1/2 flex flex-col h-[700px] bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-card-foreground flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-foreground text-lg">
                        No conversation yet
                      </p>
                      <p className="text-muted-foreground text-sm mt-2 max-w-md">
                        {pdfText
                          ? "Ask a question about your PDF to get started"
                          : "Upload a PDF first, then ask questions about its content"}
                      </p>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            className="prose prose-sm max-w-none prose-invert"
                            components={{
                              strong: ({ ...props }) => (
                                <span
                                  className="font-semibold text-primary"
                                  {...props}
                                />
                              ),
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  className="border-l-4 border-primary pl-4 italic"
                                  {...props}
                                />
                              ),
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc pl-4 space-y-1"
                                  {...props}
                                />
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  className="text-lg font-semibold mt-2 mb-1 text-primary"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <form
                onSubmit={handleSubmit}
                className="flex gap-2 p-4 border-t border-border bg-muted/50"
              >
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    pdfText
                      ? "Ask a question about your PDF..."
                      : "Upload a PDF first"
                  }
                  disabled={!pdfText || loading}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                />
                <Button
                  type="submit"
                  disabled={!pdfText || loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
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
    </div>
  );
}
