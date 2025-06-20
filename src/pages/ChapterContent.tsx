"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Brain, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Chapter, Course } from "../types/course";

export default function ChapterContent() {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, chapterId]);

  const fetchContent = async () => {
    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      if (chapterError) throw chapterError;

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (courseError) throw courseError;

      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", courseData.id)
        .order("order_index", { ascending: true });

      if (chaptersError) throw chaptersError;

      setChapters(chaptersData || []);
      setChapter(chapterData);
      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching content:", error);
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = () => {
    sessionStorage.setItem("quizTopic", chapter?.title || "");
    sessionStorage.setItem("quizContent", chapter?.content || "");
    navigate("/quiz");
  };

  // handle key press to navigate to next and previous chapter
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

      if (e.key === "ArrowLeft" && chapter && chapters.length > 0) {
        // Navigate to previous chapter
        const currentIndex = chapters.findIndex((c) => c.id === chapterId);
        if (currentIndex > 0) {
          e.preventDefault();
          navigate(
            `/courses/${courseId}/chapters/${chapters[currentIndex - 1].id}`
          );
        }
      } else if (e.key === "ArrowRight" && chapter && chapters.length > 0) {
        // Navigate to next chapter
        const currentIndex = chapters.findIndex((c) => c.id === chapterId);
        if (currentIndex < chapters.length - 1) {
          e.preventDefault();
          navigate(
            `/courses/${courseId}/chapters/${chapters[currentIndex + 1].id}`
          );
        }
      }
    };

    // Add event listener when component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chapter, chapters, chapterId, courseId, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <p className="mt-6 text-xl text-foreground">
            Loading Chapter Content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(`/courses`)}
            className="inline-flex items-center text-muted-foreground hover:text-primary hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <Button
            onClick={handleGenerateQuiz}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate Quiz
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-border bg-card/30">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 md:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <BookOpen className="text-primary" />
                <span>{course?.title}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (chapter && course && chapters.length > 0) {
                      const currentIndex = chapters.findIndex(
                        (c) => c.id === chapterId
                      );
                      if (currentIndex > 0) {
                        navigate(
                          `/courses/${courseId}/chapters/${
                            chapters[currentIndex - 1].id
                          }`
                        );
                      }
                    }
                  }}
                  className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
                  disabled={
                    !chapter ||
                    chapters.findIndex((c) => c.id === chapterId) <= 0
                  }
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-foreground px-2 font-medium">
                  Chapter{" "}
                  {
                    chapters[chapters.findIndex((c) => c.id === chapterId)]
                      .order_index
                  }
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (chapter && course && chapters.length > 0) {
                      const currentIndex = chapters.findIndex(
                        (c) => c.id === chapterId
                      );
                      if (currentIndex < chapters.length - 1) {
                        navigate(
                          `/courses/${courseId}/chapters/${
                            chapters[currentIndex + 1].id
                          }`
                        );
                      }
                    }
                  }}
                  className="flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:bg-muted"
                  disabled={
                    !chapter ||
                    chapters.findIndex((c) => c.id === chapterId) >=
                      chapters.length - 1
                  }
                >
                  Next
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              {chapter?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="text-2xl font-bold mt-6 mb-4 text-card-foreground"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="text-xl font-semibold mt-5 mb-3 text-card-foreground"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="text-lg font-medium mt-4 mb-2 text-card-foreground"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p className="mb-4 text-foreground leading-relaxed" {...props} />
                  ),
                  strong: ({ ...props }) => (
                  <strong className="font-semibold text-foreground" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul
                      className="list-disc pl-6 mb-4 text-foreground"
                      {...props}
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      className="list-decimal pl-6 mb-4 text-foreground"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li className="mb-1 text-foreground" {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground bg-muted/20 py-2 rounded-r-lg"
                      {...props}
                    />
                  ),
                  // @ts-expect-error: Custom renderer signature not fully compatible with type definitions
                  code: ({ inline, ...props }) =>
                    inline ? (
                      <code
                        className="bg-muted px-2 py-1 rounded text-sm text-primary font-medium border border-border"
                        {...props}
                      />
                    ) : (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto border border-border my-4">
                        <code className="text-sm text-foreground font-mono" {...props} />
                      </pre>
                    ),
                }}
              >
                {chapter?.content || ""}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
