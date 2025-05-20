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
  const [chapters, setChapters] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
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
        .eq("course_id", courseData.id);

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
          navigate(`/courses/${courseId}/chapters/${chapters[currentIndex - 1].id}`);
        }
      } else if (e.key === "ArrowRight" && chapter && chapters.length > 0) {
        // Navigate to next chapter
        const currentIndex = chapters.findIndex((c) => c.id === chapterId);
        if (currentIndex < chapters.length - 1) {
          e.preventDefault();
          navigate(`/courses/${courseId}/chapters/${chapters[currentIndex + 1].id}`);
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
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-purple-400 animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-purple-400" />
          </div>
          <p className="mt-6 text-xl text-gray-100">
            Loading Chapter Content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(`/courses`)}
            className="inline-flex items-center text-gray-300 hover:text-purple-400"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <Button
            onClick={handleGenerateQuiz}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate Quiz
          </Button>
        </div>

        <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 overflow-hidden">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2 md:justify-between">
              <div className="flex item-center gap-2 text-sm font-medium mb-2">
                <BookOpen className=" text-purple-400" />
                <span>{course?.title}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
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
                  className="flex items-center gap-2 border-gray-700 text-gray-900"
                  disabled={
                    !chapter ||
                    chapters.findIndex((c) => c.id === chapterId) <= 0
                  }
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-gray-300 px-2">
                  Chapter {
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
                  className="flex items-center gap-2 border-gray-700 text-gray-900"
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
            <CardTitle className="text-2xl font-bold text-gray-100">
              {chapter?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-2xl font-bold mt-6 mb-4 text-gray-100"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-xl font-semibold mt-5 mb-3 text-gray-100"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-lg font-medium mt-4 mb-2 text-gray-100"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-4 text-gray-300" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc pl-6 mb-4 text-gray-300"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal pl-6 mb-4 text-gray-300"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1 text-gray-300" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-purple-500 pl-4 italic my-4 text-gray-300"
                      {...props}
                    />
                  ),
                  //@ts-ignore
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        className="bg-gray-800 px-1 py-0.5 rounded text-sm text-purple-300"
                        {...props}
                      />
                    ) : (
                      <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto">
                        <code className="text-sm text-gray-300" {...props} />
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
