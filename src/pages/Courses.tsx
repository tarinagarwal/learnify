"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Book,
  Plus,
  ChevronRight,
  Loader2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  generateCourseOutline,
  generateChapterContent,
} from "../services/groq";
import type { Course, Chapter } from "../types/course";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Translate } from "../components/Translate";

interface CourseWithRating extends Course {
  average_rating?: number;
  total_ratings?: number;
  user_rating?: number;
  chapters?: Chapter[];
}

const ITEMS_PER_PAGE = 6;

export default function Courses() {
  const navigate = useNavigate();

  // State variables
  const [courses, setCourses] = useState<CourseWithRating[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithRating[]>(
    []
  );
  const [selectedCourse, setSelectedCourse] = useState<CourseWithRating | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "my-courses"

  const chaptersRef = useRef<HTMLDivElement | null>(null);

  // Hooks for pagination/bookmarks
  const {
    bookmarks,
    loading: bookmarksLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
  } = useBookmarks("course");

  const {
    currentItems,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination({
    items: filteredCourses,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  // Effects
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    let filtered = courses;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply bookmarks filter
    if (showBookmarked) {
      filtered = filtered.filter((course) => isBookmarked(course.id));
    }

    setFilteredCourses(filtered);
  }, [courses, searchQuery, showBookmarked, bookmarks, isBookmarked]);

  // Fetch courses based on active tab
  const fetchCourses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);

      let query = supabase.from("courses").select("*");

      // Filter by user_id if on "my-courses" tab
      if (activeTab === "my-courses") {
        query = query.eq("user_id", user.id);
      }

      const { data: coursesData, error: coursesError } = await query.order(
        "created_at",
        { ascending: false }
      );

      if (coursesError) throw coursesError;

      // For each course, get average rating, total ratings, and user's rating
      const coursesWithRatings: CourseWithRating[] = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { data: ratingData } = await supabase.rpc("get_course_rating", {
            course_uuid: course.id,
          });

          const { data: userRating } = await supabase
            .from("course_ratings")
            .select("rating")
            .eq("course_id", course.id)
            .eq("user_id", user.id)
            .maybeSingle();

          return {
            ...course,
            average_rating: ratingData?.[0]?.average_rating || 0,
            total_ratings: ratingData?.[0]?.total_ratings || 0,
            user_rating: userRating?.rating || 0,
          };
        })
      );

      setCourses(coursesWithRatings);
      setFilteredCourses(coursesWithRatings);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersForCourse = async (course: CourseWithRating) => {
    try {
      const { data: chapters, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", course.id)
        .order("order_index");

      if (error) throw error;

      return chapters as Chapter[];
    } catch (error) {
      console.error("Error fetching chapters:", error);
      return [];
    }
  };

  const handleCourseClick = async (course: CourseWithRating) => {
    const courseChapters = await fetchChaptersForCourse(course);
    setSelectedCourse({ ...course, chapters: courseChapters });

    setTimeout(() => {
      chaptersRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleRating = async (courseId: string, rating: number) => {
    try {
      setRatingLoading(courseId);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("course_ratings").upsert(
        {
          course_id: courseId,
          user_id: user.id,
          rating,
        },
        {
          onConflict: "course_id,user_id",
        }
      );

      if (error) throw error;

      await fetchCourses();

      if (selectedCourse?.id === courseId) {
        const updatedChapters = await fetchChaptersForCourse(selectedCourse);
        setSelectedCourse((prev) =>
          prev
            ? {
                ...prev,
                user_rating: rating,
                chapters: updatedChapters,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error rating course:", error);
    } finally {
      setRatingLoading(null);
    }
  };

  const handleCreateCourse = async () => {
    if (!topic.trim()) return;

    try {
      setGenerating(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const outline = await generateCourseOutline(topic);

      if (!outline || typeof outline !== "object") {
        throw new Error("Failed to generate course outline");
      }

      const courseTitle =
        outline.title &&
        typeof outline.title === "string" &&
        outline.title.trim()
          ? outline.title.trim()
          : `Course: ${topic}`;

      const { data: newCourse, error: courseError } = await supabase
        .from("courses")
        .insert({
          title: courseTitle,
          description: outline.description || `Course about ${topic}`,
          user_id: user.id,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      if (Array.isArray(outline.chapters)) {
        const chaptersPromises = outline.chapters.map(
          async (chapterOutline, index) => {
            const chapterTitle =
              chapterOutline.title?.trim() || `Chapter ${index + 1}`;

            const content = await generateChapterContent(
              courseTitle,
              chapterTitle,
              chapterOutline.description || ""
            );

            return supabase.from("chapters").insert({
              course_id: newCourse.id,
              title: chapterTitle,
              content,
              order_index: chapterOutline.order_index || index,
            });
          }
        );

        await Promise.all(chaptersPromises);
      }

      setTopic("");
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create course"
      );
    } finally {
      setGenerating(false);
    }
  };

  const toggleBookmark = async (courseId: string) => {
    if (isBookmarked(courseId)) {
      await removeBookmark(courseId);
    } else {
      await addBookmark(courseId);
    }
  };

  if (loading || bookmarksLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-primary/10">
            {/* Animated grid background */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary/20 backdrop-blur-sm rounded-full mb-4">
                <Book className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
                <Translate>Courses</Translate>
              </h2>
              <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
                <Translate>
                  Expand your knowledge with interactive courses
                </Translate>
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse bg-card/50 backdrop-blur-sm border-border"
                >
                  <CardHeader>
                    <div className="h-48 bg-muted rounded-md mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded"></div>
                      <div className="h-8 bg-muted rounded"></div>
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
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with animated background */}
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-primary/10">
          {/* Animated grid background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          {/* Animated particles */}
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
              <Book className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
              <Translate>Courses</Translate>
            </h2>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
              <Translate>
                Expand your knowledge with interactive courses
              </Translate>
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search courses..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <TabsList className="bg-muted">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                >
                  <Translate>All Courses</Translate>
                </TabsTrigger>
                <TabsTrigger
                  value="my-courses"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                >
                  <Translate>My Courses</Translate>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
              <Button
                variant={showBookmarked ? "default" : "outline"}
                onClick={() => setShowBookmarked(!showBookmarked)}
                className={
                  showBookmarked
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border text-primary hover:bg-primary/10"
                }
              >
                {showBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                ) : (
                  <Bookmark className="h-4 w-4 mr-2" />
                )}
                {showBookmarked ? (
                  <Translate>Show All</Translate>
                ) : (
                  <Translate>Show Bookmarked</Translate>
                )}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    <Translate>Create Course</Translate>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border text-card-foreground">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      <Translate>Create New Course</Translate>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      <Translate>Generate a comprehensive course on any topic.</Translate>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-muted-foreground">
                        <Translate>Course Topic</Translate>
                      </Label>
                      <Input
                        id="topic"
                        placeholder="Enter a topic for the course"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                      {error && (
                        <p className="text-sm text-destructive mt-1">{error}</p>
                      )}
                    </div>
                    <Button
                      onClick={handleCreateCourse}
                      disabled={generating || !topic.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <Translate>Generating Course...</Translate>
                        </>
                      ) : (
                        <Translate>Create Course</Translate>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="all">
            {filteredCourses.length === 0 ? (
              <Card className="text-center p-8 bg-card/50 backdrop-blur-sm border-border">
                <CardContent>
                  <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl text-card-foreground">
                    {showBookmarked
                      ? "No bookmarked courses found"
                      : "No courses found"}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {showBookmarked
                      ? "Bookmark some courses to see them here"
                      : "Try a different search term or create a new course"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((course) => (
                    <Card
                      key={course.id}
                      onClick={() => handleCourseClick(course)}
                      className={`transition-all duration-300 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 flex flex-col cursor-pointer ${
                        selectedCourse?.id === course.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-card-foreground">
                            <Translate>{course.title}</Translate>
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(course.id);
                            }}
                          >
                            {isBookmarked(course.id) ? (
                              <BookmarkCheck className="h-5 w-5 text-primary" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                        <CardDescription className="text-muted-foreground">
                          <Translate>{course.description}</Translate>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <StarRating
                          rating={course.average_rating || 0}
                          totalRatings={course.total_ratings || 0}
                          userRating={course.user_rating}
                          onRate={(r) => handleRating(course.id, r)}
                          loading={ratingLoading === course.id}
                        />
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
                                <PaginationItem key={`dots-${index}`} disabled>
                                  <span className="px-2 text-muted-foreground">
                                    ...
                                  </span>
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
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "text-muted-foreground border-border hover:text-foreground hover:bg-muted"
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
                            className="text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="my-courses">
            {filteredCourses.length === 0 ? (
              <Card className="text-center p-8 bg-card/50 backdrop-blur-sm border-border">
                <CardContent>
                  <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl text-card-foreground">
                    No courses created yet
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Create your first course to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((course) => (
                  <Card
                    key={course.id}
                    onClick={() => handleCourseClick(course)}
                    className={`transition-all duration-300 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 flex flex-col cursor-pointer ${
                      selectedCourse?.id === course.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-card-foreground">
                          <Translate>{course.title}</Translate>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(course.id);
                          }}
                        >
                          {isBookmarked(course.id) ? (
                            <BookmarkCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <CardDescription className="text-muted-foreground">
                        <Translate>{course.description}</Translate>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <StarRating
                        rating={course.average_rating || 0}
                        totalRatings={course.total_ratings || 0}
                        userRating={course.user_rating}
                        onRate={(r) => handleRating(course.id, r)}
                        loading={ratingLoading === course.id}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedCourse && (
          <Card
            className="mt-8 bg-card/50 backdrop-blur-sm border-border"
            ref={chaptersRef}
          >
            <CardHeader>
              <CardTitle className="text-card-foreground">
                {selectedCourse.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedCourse.description}
              </CardDescription>
              <div className="mt-2">
                <StarRating
                  rating={selectedCourse.average_rating || 0}
                  totalRatings={selectedCourse.total_ratings || 0}
                  userRating={selectedCourse.user_rating}
                  onRate={(r) =>
                    selectedCourse.id && handleRating(selectedCourse.id, r)
                  }
                  loading={ratingLoading === selectedCourse.id}
                />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                <Translate>Chapters</Translate>
              </h3>
              {selectedCourse.chapters?.length ? (
                <div className="space-y-2">
                  {selectedCourse.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() =>
                        navigate(
                          `/courses/${selectedCourse.id}/chapters/${chapter.id}`
                        )
                      }
                      className="w-full text-left px-4 py-3 rounded-md bg-muted hover:bg-muted/80 text-foreground hover:text-primary transition-colors flex items-center justify-between group border border-border hover:border-primary"
                    >
                      <span>{chapter.title}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No chapters found.</p>
              )}
            </CardContent>
          </Card>
        )}
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
