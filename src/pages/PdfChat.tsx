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
            <MessageSquare className="mx-auto h-16 w-16 text-purple-400" />
            <h2 className="mt-2 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400">
              Chat with PDF
            </h2>
            <p className="mt-2 text-xl text-gray-300 max-w-2xl mx-auto">
              Upload a PDF and ask questions about its content
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* PDF Preview */}
          <Card className="lg:w-1/2 bg-gray-800/30 backdrop-blur-sm border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-gray-100 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-400" />
                {pdfName || "PDF Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!pdfUrl ? (
                <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-800/50 rounded-lg border border-dashed border-gray-600 p-8">
                  <Upload className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-300 text-lg mb-2">
                    Upload your PDF to get started
                  </p>
                  <p className="text-gray-400 text-sm mb-6 text-center">
                    Drag and drop your file here or click the button below
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-4 border-purple-500 text-purple-400 "
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
                        Upload PDF
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
                      <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
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
          <Card className="lg:w-1/2 flex flex-col h-[700px] bg-gray-800/30 backdrop-blur-sm border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-gray-100 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-400" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                      <p className="text-gray-300 text-lg">
                        No conversation yet
                      </p>
                      <p className="text-gray-400 text-sm mt-2 max-w-md">
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
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            className="prose prose-sm max-w-none prose-invert"
                            components={{
                              strong: ({  ...props }) => (
                                <span
                                  className="font-semibold text-purple-300"
                                  {...props}
                                />
                              ),
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  className="border-l-4 border-purple-400 pl-4 italic"
                                  {...props}
                                />
                              ),
                              ul: ({  ...props }) => (
                                <ul
                                  className="list-disc pl-4 space-y-1"
                                  {...props}
                                />
                              ),
                              h3: ({  ...props }) => (
                                <h3
                                  className="text-lg font-semibold mt-2 mb-1 text-purple-300"
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
                      <div className="bg-gray-700 rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <form
                onSubmit={handleSubmit}
                className="flex gap-2 p-4 border-t border-gray-700 bg-gray-800/50"
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
                  className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                />
                <Button
                  type="submit"
                  disabled={!pdfText || loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
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
        <style
          // @ts-expect-error: 'jsx' prop not recognized by TypeScript for style tag, but needed for styled-jsx
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
    </div>
  );
}
