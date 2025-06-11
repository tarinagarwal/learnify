"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  HistoryIcon,
  X,
  Award,
  Calendar,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import QuizResults from "../components/QuizResults";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { usePagination } from "@/hooks/use-pagination";
import { useBookmarks } from "@/hooks/use-bookmarks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface QuizHistory {
  id: string;
  topic: string;
  score: number;
  total_questions: number;
  created_at: string;
  questions: unknown[];
  answers: string[];
}

const ITEMS_PER_PAGE = 6;

export default function History() {
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizHistory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarked, setShowBookmarked] = useState(false);

  const {
    bookmarks,
    loading: bookmarksLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
  } = useBookmarks("quiz");

  const {
    currentItems,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination({
    items: filteredHistory,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let filtered = history;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply bookmarks filter
    if (showBookmarked) {
      filtered = filtered.filter((quiz) => isBookmarked(quiz.id));
    }

    setFilteredHistory(filtered);
  }, [history, searchQuery, showBookmarked, bookmarks, isBookmarked]);

  const fetchHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quiz_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const toggleBookmark = async (quizId: string) => {
    if (isBookmarked(quizId)) {
      await removeBookmark(quizId);
    } else {
      await addBookmark(quizId);
    }
  };

  const handleViewQuiz = (quiz: QuizHistory) => {
    setSelectedQuiz({
      ...quiz,
      id: quiz.id,
    });
  };

  if (loading || bookmarksLoading) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <HistoryIcon className="mx-auto h-16 w-16 text-purple-400" />
            <h2 className="mt-2 text-4xl font-bold text-white">
              Your Learning Journey
            </h2>
            <p className="mt-2 text-xl text-gray-300">
              Track your progress and revisit your quiz experiences
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse bg-gray-800 border-none">
                  <CardHeader>
                    <div className="h-48 bg-gray-700 rounded-md mb-4" />
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-700 rounded" />
                      <div className="h-8 bg-gray-700 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900/30">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff0a_1px,transparent_1px),linear-gradient(135deg,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

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
              <HistoryIcon className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400">
              Your Learning Journey
            </h2>
            <p className="mt-2 text-xl text-gray-300 max-w-2xl mx-auto">
              Track your progress and revisit your quiz experiences
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search quizzes..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            variant={showBookmarked ? "default" : "outline"}
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={
              showBookmarked
                ? "bg-purple-600 hover:bg-purple-700"
                : "border-purple-400 text-purple-400"
            }
          >
            {showBookmarked ? (
              <BookmarkCheck className="h-4 w-4 mr-2" />
            ) : (
              <Bookmark className="h-4 w-4 mr-2" />
            )}
            {showBookmarked ? "Show All" : "Show Bookmarked"}
          </Button>
        </div>

        {selectedQuiz ? (
          <Card className="mt-8 bg-gray-800/50 border-b border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">
                  {selectedQuiz.topic}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Completed on{" "}
                  {new Date(selectedQuiz.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>
            <CardContent>
              <QuizResults
                questions={selectedQuiz.questions}
                userAnswers={selectedQuiz.answers}
                onRestart={() => setSelectedQuiz(null)}
                isHistoryView={true}
                quizId={selectedQuiz.id}
              />
            </CardContent>
          </Card>
        ) : filteredHistory.length === 0 ? (
          <Card className="text-center p-8 bg-gray-800 border-none text-white">
            <CardContent>
              <HistoryIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-xl text-gray-300">
                {showBookmarked
                  ? "No bookmarked quizzes found"
                  : "Your learning journey is about to begin!"}
              </p>
              <p className="mt-2 text-gray-400">
                {showBookmarked
                  ? "Bookmark some quizzes to see them here"
                  : "Take your first quiz to see your progress here."}
              </p>
              <Button
                className="mt-6 bg-purple-600 hover:bg-purple-700"
                asChild
              >
                <a href="/quiz">Start a Quiz</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((quiz) => (
                <Card
                  key={quiz.id}
                  className=" bg-gray-800/50 border-b border-gray-700 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer text-white"
                  onClick={() => handleViewQuiz(quiz)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white truncate pr-8">
                        {quiz.topic}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(quiz.id);
                        }}
                      >
                        {isBookmarked(quiz.id) ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <CardDescription className="text-gray-400">
                      <div className="flex items-center mt-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-purple-400 mr-2" />
                        <span className="font-semibold text-gray-300">
                          Score:
                        </span>
                      </div>
                      <span className="text-lg font-bold text-white">
                        {quiz.score} / {quiz.total_questions}
                      </span>
                    </div>
                    <div className="mt-4 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (quiz.score / quiz.total_questions) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 overflow-x-auto whitespace-nowrap">
                <Pagination className="inline-flex items-center gap-2">
                  <PaginationContent className="flex">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={previousPage}
                        className="text-gray-300 hover:text-white border-gray-700 hover:bg-gray-800"
                      />
                    </PaginationItem>

                    {(() => {
                      const pagesToShow = [];

                      if (totalPages <= 3) {
                        for (let i = 1; i <= totalPages; i++) {
                          pagesToShow.push(i);
                        }
                      } else {
                        pagesToShow.push(1);

                        if (currentPage > 2) {
                          pagesToShow.push("...");
                        }

                        if (currentPage > 1 && currentPage < totalPages) {
                          pagesToShow.push(currentPage);
                        }

                        if (currentPage < totalPages - 1) {
                          pagesToShow.push("...");
                        }

                        if (totalPages !== 1) {
                          pagesToShow.push(totalPages);
                        }
                      }

                      return pagesToShow.map((page, index) => {
                        if (page === "...") {
                          return (
                            <PaginationItem key={`dots-${index}`} disabled>
                              <span className="px-2 text-gray-400">...</span>
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => goToPage(page)}
                              isActive={currentPage === page}
                              className={
                                currentPage === page
                                  ? "bg-purple-600 text-white border-purple-600"
                                  : "text-gray-300 border-gray-700 hover:bg-gray-800"
                              }
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      });
                    })()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className="text-gray-300 hover:text-white border-gray-700 hover:bg-gray-800"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
