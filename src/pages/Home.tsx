"use client";
import { Link } from "react-router-dom";
import {
  Brain,
  BookOpen,
  FileText,
  Users,
  ArrowRight,
  MessageSquare,
  Route,
  PencilRuler,
  GraduationCap,
  Sparkles,
  Zap,
  Target,
  Award,
  CheckCircle,
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuthStore();
  const [profilesCount, setProfilesCount] = useState(null);
  const [coursesCount, setCoursesCount] = useState(null);
  const [roadmapsCount, setRoadmapsCount] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      // Fetch count of profiles (Active Learners)
      const { count: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (profilesError)
        console.error("Error fetching profiles count:", profilesError);
      setProfilesCount(profiles);

      // Fetch count of courses (Courses Created)
      const { count: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });
      if (coursesError)
        console.error("Error fetching courses count:", coursesError);
      setCoursesCount(courses);

      // Fetch count of roadmaps (Roadmaps Created)
      const { count: roadmaps, error: roadmapsError } = await supabase
        .from("roadmaps")
        .select("*", { count: "exact", head: true });
      if (roadmapsError)
        console.error("Error fetching roadmaps count:", roadmapsError);
      setRoadmapsCount(roadmaps);
    };

    fetchCounts();
  }, []);

  const features = [
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "Interactive Quiz System",
      description:
        "Generate custom quizzes on any topic with adjustable difficulty levels and detailed explanations.",
      link: "/quiz",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Course Management",
      description:
        "Create and manage structured courses with chapter-based content and progress tracking.",
      link: "/courses",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Advanced PDF Tools",
      description:
        "Analyze PDFs interactively, generate quizzes from content, and manage your document library.",
      link: "/resources",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "PDF Chat",
      description:
        "Have interactive conversations with your PDF documents and get instant answers to your questions.",
      link: "/pdf-chat",
    },
    {
      icon: <Route className="h-10 w-10 text-primary" />,
      title: "Learning Roadmaps",
      description:
        "Follow structured learning paths with detailed guides for any technology or skill.",
      link: "/roadmaps",
    },
    {
      icon: <PencilRuler className="h-10 w-10 text-primary" />,
      title: "Interactive Notebooks",
      description:
        "Create and organize your notes with our interactive whiteboard system.",
      link: "/dashboard",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Community Learning",
      description:
        "Connect with other learners, share knowledge, and learn together in our community.",
      link: "/community",
    },
    {
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      title: "Expert Guidance",
      description: "Get help from our community experts when you need it most.",
      link: "/community",
    },
  ];

  const benefits = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI-Powered Learning",
      description:
        "Leverage advanced AI to generate quizzes, analyze documents, and create personalized learning paths.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Learn Faster",
      description:
        "Interactive tools and immediate feedback help you grasp concepts more quickly and effectively.",
    },
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "Stay Focused",
      description:
        "Structured courses and roadmaps keep you on track towards your learning goals.",
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: "Track Progress",
      description:
        "Monitor your learning journey with detailed progress tracking and analytics.",
    },
  ];

  const highlights = [
    "Interactive learning experiences",
    "AI-powered content generation",
    "Personalized learning paths",
    "Expert community support",
    "Progress tracking & analytics",
    "Rich multimedia content",
    "Collaborative features",
    "Mobile-friendly design",
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      content:
        "Learnify transformed how I approach learning new technologies. The interactive quizzes and roadmaps helped me master React in half the time I expected.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      content:
        "The PDF tools and AI-powered features are game-changers. I can extract insights from research papers and create study materials in minutes.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "UX Designer",
      content:
        "The community aspect of Learnify sets it apart. I've connected with other designers who've helped me grow my skills exponentially.",
      rating: 4,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-muted to-primary/10 text-foreground overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-0 opacity-30">
          {[...Array(20)].map((_, i) => (
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center justify-center px-4 py-2 border border-accent text-sm font-medium rounded-full text-foreground bg-accent/20 backdrop-blur-sm">
              <span className="flex items-center">
                <Brain className="w-4 h-4 mr-2 text-primary" />
                Welcome to the Future of Learning
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary pb-4">
              Transform Your Learning Journey
            </h1>

            <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-muted-foreground leading-relaxed">
              Experience the power of AI-driven education with interactive
              courses, smart tools, and a supportive community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 rounded-full"
                  >
                    <Link to="/roadmaps">Explore Roadmaps</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-primary text-primary rounded-full hover:bg-primary/10"
                  >
                    <Link to="/courses">Explore Courses</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 rounded-full"
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-primary text-primary rounded-full hover:bg-primary/10"
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Highlights */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-4xl mx-auto">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground"
                >
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our comprehensive suite of learning tools designed to
              help you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-card hover:bg-card/80 transition-all duration-300 border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 overflow-hidden"
              >
                <Link to={feature.link}>
                  <CardHeader>
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-card-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--border))_1px,transparent_1px),linear-gradient(135deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied learners who have transformed their
              education journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-card-foreground">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {testimonial.role}
                      </CardDescription>
                    </div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-primary fill-primary"
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Gradient Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Learnify?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the advantages of our modern learning platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="relative group p-8 rounded-2xl bg-card hover:bg-card/80 border border-border hover:border-primary/20 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="bg-muted rounded-xl p-3 w-fit mb-4 shadow-sm group-hover:shadow-lg group-hover:ring-2 group-hover:ring-primary/20 transition-all duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {profilesCount !== null ? profilesCount : "..."}
              </div>
              <p className="text-muted-foreground">Active Learners</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {coursesCount !== null ? coursesCount : "..."}
              </div>
              <p className="text-muted-foreground">Courses Created</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {roadmapsCount !== null ? roadmapsCount : "..."}
              </div>
              <p className="text-muted-foreground">Roadmaps Created</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                24/7
              </div>
              <p className="text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/20 to-secondary text-foreground overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already transforming their
            education with Learnify.
          </p>
          {user ? (
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 rounded-full"
            >
              <Link to="/dashboard" className="flex items-center">
                Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 rounded-full"
            >
              <Link to="/signup" className="flex items-center">
                Get Started for Free <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Add keyframes for floating animation */}
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
