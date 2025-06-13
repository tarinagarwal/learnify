import { useState } from "react";
import type { Question } from "../types/quiz";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Sparkles } from "lucide-react";

interface Props {
  question: Question;
  onAnswer: (answer: string) => void;
  currentQuestion: number;
  totalQuestions: number;
}

export default function QuizQuestion({
  question,
  onAnswer,
  currentQuestion,
  totalQuestions,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAnswer(selectedOption);
      setSelectedOption(null);
      setIsSubmitting(false);
    }, 500);
  };

  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated grid background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0 opacity-30">
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
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-muted-foreground">
              <div className="p-2 rounded-full bg-primary/20 mr-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <Progress
            value={progressPercentage}
            className="h-3 bg-muted border border-border rounded-full overflow-hidden"
            // @ts-expect-error: 'indicatorClassName' prop is not defined in Progress typings but used for styling
            indicatorClassName="bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          />
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border mb-8 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-primary/20 transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-accent/20 mt-1">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-card-foreground leading-relaxed">
                  {question.question}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Select the best answer from the options below
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4 mb-8">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleOptionSelect(option)}
              variant="outline"
              className={`w-full justify-start text-left h-auto py-6 px-6 border-2 transition-all duration-300 rounded-xl ${
                selectedOption === option
                  ? "bg-primary/10 border-primary ring-2 ring-primary/20 text-card-foreground shadow-lg"
                  : "bg-card/50 backdrop-blur-sm border-border text-muted-foreground hover:border-primary/50 hover:bg-card/80 hover:text-foreground"
              }`}
            >
              <div className="flex items-center w-full">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    selectedOption === option
                      ? "border-primary bg-primary shadow-md"
                      : "border-muted-foreground"
                  } mr-4 flex items-center justify-center`}
                >
                  {selectedOption === option && (
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </Button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3"></div>
              Submitting...
            </div>
          ) : (
            "Submit Answer"
          )}
        </Button>
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
