
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
import { CheckCircle, Clock } from "lucide-react";

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
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-purple-400" />
            <span className="text-sm">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>
          <span className="text-sm font-medium text-purple-400">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-2 bg-gray-700"
           // @ts-expect-error: 'indicatorClassName' prop is not defined in Progress typings but used for styling
          indicatorClassName="bg-gradient-to-r from-purple-500 to-purple-400"
        />
      </div>

      <Card className="bg-gray-800/50 border-gray-700 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-gray-100">
            {question.question}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select the best answer
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleOptionSelect(option)}
            variant="outline"
            className={`w-full justify-start text-left h-auto py-4 px-4 border-gray-600 hover:border-purple-400 hover:bg-gray-700/50 transition-all ${
              selectedOption === option
                ? "bg-purple-600/20 border-purple-400 text-gray-100"
                : "bg-gray-800/30 text-gray-300"
            }`}
          >
            <div className="flex items-center w-full">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                  selectedOption === option
                    ? "border-purple-400 bg-purple-600"
                    : "border-gray-500"
                } mr-3 flex items-center justify-center`}
              >
                {selectedOption === option && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
              <span>{option}</span>
            </div>
          </Button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedOption || isSubmitting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
      >
        {isSubmitting ? "Submitting..." : "Submit Answer"}
      </Button>
    </div>
  );
}
