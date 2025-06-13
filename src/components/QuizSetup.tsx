"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Upload, FileText, Lightbulb, Zap } from "lucide-react";
import type { QuizConfig } from "../types/quiz";
import { extractTextFromPdf } from "../utils/pdfExtractor";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  onStart: (config: QuizConfig) => void;
  initialConfig?: QuizConfig;
}

export default function QuizSetup({ onStart, initialConfig }: Props) {
  const [topic, setTopic] = useState(initialConfig?.topic || "");
  const [difficulty, setDifficulty] = useState(initialConfig?.difficulty || "medium");
  const [numQuestions, setNumQuestions] = useState(initialConfig?.numQuestions || 5);
  const [quizType, setQuizType] = useState<"topic" | "pdf">("topic");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedPdfContent = sessionStorage.getItem("pdfContent");
    const storedPdfName = sessionStorage.getItem("pdfName");
    const storedTopic = sessionStorage.getItem("quizTopic");

    if (storedPdfContent && storedPdfName) {
      setQuizType("pdf");
      onStart({
        topic: storedPdfName,
        difficulty,
        numQuestions,
        pdfContent: storedPdfContent,
      });
      sessionStorage.clear();
    } else if (storedTopic) {
      setTopic(storedTopic);
      sessionStorage.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
    }

    try {
      setLoading(true);
      setPdfFile(file);
      const pdfText = await extractTextFromPdf(file);
      onStart({
        topic: file.name,
        difficulty,
        numQuestions,
        pdfContent: pdfText,
      });
    } catch (error) {
      console.error("Error in processing file", error);
      setError("Error processing PDF file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (quizType === "pdf" && pdfFile) {
        const pdfText = await extractTextFromPdf(pdfFile);
        onStart({
          topic: pdfFile.name,
          difficulty,
          numQuestions,
          pdfContent: pdfText,
        });
      } else {
        onStart({ topic, difficulty, numQuestions });
      }
    } catch (error) {
      console.error("Error in processing file", error);
      setError("Error processing PDF file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const popularTopics = [
    { name: "JavaScript Fundamentals", icon: <Zap className="h-4 w-4" /> },
    { name: "Machine Learning Basics", icon: <Lightbulb className="h-4 w-4" /> },
    { name: "World History", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold text-foreground mb-2">
          Quiz Setup
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose a topic or upload a PDF to generate quiz questions
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <Tabs defaultValue="topic" onValueChange={(value) => setQuizType(value as "topic" | "pdf")}>
          <TabsList className="grid grid-cols-2 mb-6 bg-muted rounded-lg">
            <TabsTrigger value="topic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lightbulb className="h-4 w-4 mr-2" /> By Topic
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" /> From PDF
            </TabsTrigger>
          </TabsList>

          {error && (
            <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <TabsContent value="topic">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  readOnly={!!initialConfig?.topic}
                  placeholder="Enter a topic for your quiz"
                  className="bg-background text-foreground border border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Popular Topics</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {popularTopics.map((item, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant="outline"
                      onClick={() => setTopic(item.name)}
                      className="justify-start"
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="bg-background text-foreground border border-border">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground border border-border">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numQuestions">Number of Questions</Label>
                  <Input
                    type="number"
                    id="numQuestions"
                    min="1"
                    max="10"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="bg-background text-foreground border border-border"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !topic}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Processing..." : "Start Quiz"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="pdf">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload PDF</Label>
                <Label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 mb-3 rounded-full bg-muted">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF (MAX. 10MB)</p>
                  </div>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfChange}
                    required={quizType === "pdf"}
                  />
                </Label>

                {pdfFile && (
                  <div className="flex items-center mt-2 p-2 bg-muted rounded-lg">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    <p className="text-sm text-foreground truncate">{pdfFile.name}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="bg-background text-foreground border border-border">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground border border-border">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numQuestions">Number of Questions</Label>
                  <Input
                    type="number"
                    id="numQuestions"
                    min="1"
                    max="10"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="bg-background text-foreground border border-border"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !pdfFile}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Processing..." : "Start Quiz"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}
