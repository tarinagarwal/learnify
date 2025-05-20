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
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    }
    setLoading(false);
  };

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (currentQuestion === questions.length - 1) {
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

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
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
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
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
            <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 backdrop-blur-sm rounded-full mb-4">
              <Brain className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400">
              Quiz Master
            </h2>
            <p className="mt-2 text-xl text-gray-300 max-w-2xl mx-auto">
              Test your knowledge and challenge yourself on any topic
            </p>
          </div>
        </div>

        <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-t-4 border-purple-400 animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-purple-400" />
                </div>
                <p className="mt-6 text-gray-300">Generating your quiz...</p>
                <p className="text-sm text-gray-400 max-w-md text-center mt-2">
                  Our AI is crafting challenging questions based on your
                  selected topic
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center p-3 bg-red-500/20 backdrop-blur-sm rounded-full mb-4">
                  <Brain className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-red-300 mb-4">{error}</p>
                <Button
                  onClick={handleRestart}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : questions.length === 0 ? (
              <QuizSetup onStart={handleStart} />
            ) : userAnswers.length === questions.length ? (
              <QuizResults
                questions={questions}
                userAnswers={userAnswers}
                onRestart={handleRestart}
                //@ts-ignore
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

      {/* Animation keyframes */}
      <style
        //@ts-ignore
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
  );
}