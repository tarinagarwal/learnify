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
import { Translate } from "../components/Translate";

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
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <HistoryIcon className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-2 text-4xl font-bold text-foreground text-center">
              <Translate>Your Learning Journey</Translate>
            </h2>
            <p className="mt-2 text-xl text-muted-foreground text-center">
              <Translate>Track your progress and revisit your quiz experiences</Translate>
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse bg-card border-border">
                  <CardHeader>
                    <div className="h-48 bg-muted rounded-md mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded" />
                      <div className="h-8 bg-muted rounded" />
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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-primary/10">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="absolute inset-0 opacity-30">
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
              <HistoryIcon className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
              <Translate>Your Learning Journey</Translate>
            </h2>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
              <Translate>Track your progress and revisit your quiz experiences</Translate>
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search quizzes..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            variant={showBookmarked ? "default" : "outline"}
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={
              showBookmarked
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "border-primary text-primary hover:bg-primary/10"
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
          <Card className="mt-8 bg-card/50 border-border text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-card-foreground">
                  <Translate>{selectedQuiz?.topic}</Translate>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <Translate>Completed on</Translate> {new Date(selectedQuiz?.created_at ?? '').toLocaleDateString()}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedQuiz(null)}
                className="text-muted-foreground hover:text-foreground"
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
          <Card className="text-center p-8 bg-card border-border text-card-foreground">
            <CardContent>
              <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                {showBookmarked
                  ? "No bookmarked quizzes found"
                  : "Your learning journey is about to begin!"}
              </p>
              <p className="mt-2 text-muted-foreground">
                {showBookmarked
                  ? "Bookmark some quizzes to see them here"
                  : "Take your first quiz to see your progress here."}
              </p>
              <Button
                className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                  className="bg-card/50 border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300 cursor-pointer text-card-foreground"
                  onClick={() => handleViewQuiz(quiz)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-card-foreground truncate pr-8">
                        {quiz.topic}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary/90 hover:bg-muted"
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
                    <CardDescription className="text-muted-foreground">
                      <div className="flex items-center mt-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-primary mr-2" />
                        <span className="font-semibold text-muted-foreground">
                          Score:
                        </span>
                      </div>
                      <span className="text-lg font-bold text-card-foreground">
                        {quiz.score} / {quiz.total_questions}
                      </span>
                    </div>
                    <div className="mt-4 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            (quiz.score / quiz.total_questions) * 100
                          }%`,
                        }}
                      />
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
                        className="text-muted-foreground hover:text-foreground border-border hover:bg-muted"
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
                            <span key={index} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={index}
                            className={`px-2 ${
                              currentPage === page ? "font-bold" : ""
                            }`}
                            onClick={() => goToPage(page as number)}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className="text-muted-foreground hover:text-foreground border-border hover:bg-muted"
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
