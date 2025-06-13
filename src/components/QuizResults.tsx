"use client";
import {
  Trophy,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Loader2,
} from "lucide-react";
import type { Question } from "../types/quiz";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { generateQuizAnalytics } from "../services/groq";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface Props {
  questions: Question[];
  userAnswers: string[];
  onRestart: () => void;
  isHistoryView?: boolean;
  quizId?: string | null;
}

export default function QuizResults({
  questions,
  userAnswers,
  onRestart,
  isHistoryView,
  quizId,
}: Props) {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [generatingAnalytics, setGeneratingAnalytics] = useState(false);
  const [hasAnalytics, setHasAnalytics] = useState(false);

  const score = questions.reduce(
    (acc, q, idx) => (q.correctAnswer === userAnswers[idx] ? acc + 1 : acc),
    0
  );

  const percentage = Math.round((score / questions.length) * 100);

  useEffect(() => {
    // Check if analytics exists for this quiz
    const checkAnalytics = async () => {
      if (!quizId) return;

      const { data } = await supabase
        .from("quiz_analytics")
        .select("id")
        .eq("quiz_id", quizId)
        .single();

      setHasAnalytics(!!data);
    };

    checkAnalytics();
  }, [quizId]);

  const toggleItem = (idx: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleGenerateAnalytics = async () => {
    try {
      setGeneratingAnalytics(true);

      // Get the quiz ID from the URL if in history view
      const urlParams = new URLSearchParams(window.location.search);
      const currentQuizId = urlParams.get("id") || quizId;

      if (!currentQuizId) {
        console.error("No quiz ID found");
        return;
      }

      // Generate analytics
      const analysis = await generateQuizAnalytics(questions, userAnswers);

      // Get user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Store analytics in Supabase
      const { error } = await supabase.from("quiz_analytics").insert({
        quiz_id: currentQuizId,
        user_id: user.id,
        analysis,
      });

      if (error) throw error;

      // Navigate to analytics page
      navigate(`/quiz-analytics/${currentQuizId}`);
    } catch (error) {
      console.error("Error generating analytics:", error);
    } finally {
      setGeneratingAnalytics(false);
    }
  };

  // Determine performance message
  let performanceMessage = "";
  let performanceColor = "";

  if (percentage >= 90) {
    performanceMessage = "Outstanding! You're a master of this topic!";
    performanceColor = "text-green-400";
  } else if (percentage >= 70) {
    performanceMessage = "Great job! You have a solid understanding.";
    performanceColor = "text-green-400";
  } else if (percentage >= 50) {
    performanceMessage = "Good effort! Keep practicing to improve.";
    performanceColor = "text-yellow-400";
  } else {
    performanceMessage = "Keep learning! This topic needs more study.";
    performanceColor = "text-red-400";
  }

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

      <div className="max-w-4xl mx-auto relative z-10">
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-xl overflow-hidden">
          <CardHeader className="px-6 pt-6 text-center border-b border-border bg-card/30">
            <div className="inline-flex items-center justify-center p-3 bg-yellow-500/20 backdrop-blur-sm rounded-full mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-card-foreground">
              {isHistoryView ? "Quiz Results" : "Quiz Complete!"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isHistoryView ? "Review your performance" : "See how well you did"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="text-center mb-10">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-8 border-border"></div>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                >
                  <circle
                    className="text-muted"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (percentage / 100) * 264}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-card-foreground">
                    {percentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {score} of {questions.length} correct
                  </span>
                </div>
              </div>
              <p className={`text-lg font-medium ${performanceColor}`}>
                {performanceMessage}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {questions.map((q, idx) => {
                const isCorrect = q.correctAnswer === userAnswers[idx];
                return (
                  <Collapsible
                    key={idx}
                    open={openItems[idx]}
                    onOpenChange={() => toggleItem(idx)}
                  >
                    <Card
                      className={`bg-card/50 backdrop-blur-sm border-l-4 ${
                        isCorrect ? "border-l-green-500" : "border-l-red-500"
                      } border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 p-1 rounded-full ${
                                isCorrect
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base font-medium text-card-foreground">
                                {q.question}
                              </CardTitle>
                              <CardDescription className="text-sm text-muted-foreground mt-1">
                                Your answer: {userAnswers[idx]}
                              </CardDescription>
                            </div>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-muted"
                            >
                              {openItems[idx] ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="p-4 pt-0">
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-sm mb-1">
                              <span className="font-medium text-primary">
                                Correct answer:
                              </span>{" "}
                              <span className="text-card-foreground">
                                {q.correctAnswer}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-3 rounded-md border border-border">
                              {q.explanation}
                            </p>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>

            <div className="flex flex-col gap-4">
              {quizId && (
                <>
                  {hasAnalytics ? (
                    <Button
                      onClick={() => navigate(`/quiz-analytics/${quizId}`)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      View Analytics
                    </Button>
                  ) : (
                    <Button
                      onClick={handleGenerateAnalytics}
                      disabled={generatingAnalytics}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                    >
                      {generatingAnalytics ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating Analysis...
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5 mr-2" />
                          AI Mentor Analysis
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}

              <Button
                onClick={onRestart}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                {isHistoryView ? "Back to History" : "Try Another Quiz"}
              </Button>
            </div>
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
  );
}
