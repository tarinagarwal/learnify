import React, { useState, useEffect } from "react";
import { Brain, Sparkles } from "lucide-react";
import QuizSetup from "./QuizSetup";
import QuizQuestion from "./QuizQuestion";
import QuizResults from "./QuizResults";
import { generateQuestions } from "../services/groq";
import { supabase } from "../lib/supabase";
import type { Question, QuizConfig } from "../types/quiz";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    const storedTopic = sessionStorage.getItem("quizTopic");
    const storedContent = sessionStorage.getItem("quizContent");

    if (storedTopic) {
      setQuizConfig({
        topic: storedTopic,
        difficulty: "medium",
        numQuestions: 5,
        ...(storedContent && { pdfContent: storedContent }),
      });

      sessionStorage.removeItem("quizTopic");
      sessionStorage.removeItem("quizContent");
    }
  }, []);

  const handleStart = async (config: QuizConfig) => {
    setLoading(true);
    setError(null);
    setQuizConfig(config);

    try {
      const generatedQuestions = await generateQuestions(config);
      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setUserAnswers([]);
    } catch {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    const isLast = currentQuestion === questions.length - 1;

    if (isLast) {
      const score = newAnswers.reduce(
        (acc, ans, idx) =>
          questions[idx].correctAnswer === ans ? acc + 1 : acc,
        0
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && quizConfig) {
        const { data, error } = await supabase
          .from("quiz_history")
          .insert({
            user_id: user.id,
            topic: quizConfig.topic,
            score,
            total_questions: questions.length,
            questions,
            answers: newAnswers,
          })
          .select()
          .single();

        if (!error && data) {
          setQuizId(data.id);
        }
      }
    }

    if (!isLast) setCurrentQuestion(currentQuestion + 1);
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setError(null);
    setQuizConfig(null);
    setQuizId(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-muted/50">
          <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,#ffffff0a_1px,transparent_1px),linear-gradient(135deg,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
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
            <div className="inline-flex items-center justify-center p-3 bg-primary/20 backdrop-blur-sm rounded-full mb-4">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-blue-400">
              Quiz Master
            </h2>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
              Test your knowledge and challenge yourself on any topic
            </p>
          </div>
        </div>

        <Card className="bg-card border border-border shadow-md rounded-xl">
  <CardContent className="p-6">
    {loading ? (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
        </div>
        <p className="mt-6 text-muted-foreground">Generating your quiz...</p>
        <p className="text-sm text-muted-foreground max-w-md text-center mt-2">
          Our AI is crafting challenging questions based on your selected topic
        </p>
      </div>
    ) : error ? (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center p-3 bg-destructive/20 backdrop-blur-sm rounded-full mb-4">
          <Brain className="w-12 h-12 text-destructive" />
        </div>
        <p className="text-destructive mb-4">{error}</p>
        <Button
          onClick={handleRestart}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Try Again
        </Button>
      </div>
    ) : questions.length === 0 ? (
      <div className="space-y-4">
        <QuizSetup onStart={handleStart} />
      </div>
    ) : userAnswers.length === questions.length ? (
      <QuizResults
        questions={questions}
        userAnswers={userAnswers}
        onRestart={handleRestart}
        // @ts-expect-error: `quizId` is required by the component but not defined in this code path due to conditional rendering logic.
        quizId={quizId}
      />
    ) : (
      <QuizQuestion
        question={questions[currentQuestion]}
        onAnswer={handleAnswer}
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
      />
    )}
  </CardContent>
</Card>

      </div>

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
