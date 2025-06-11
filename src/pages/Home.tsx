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
      // @ts-expect-error: Argument type 'profiles' may not match the expected type for setProfilesCount
      setProfilesCount(profiles);

      // Fetch count of courses (Courses Created)
      const { count: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });
      if (coursesError)
        console.error("Error fetching courses count:", coursesError);
      // @ts-expect-error: Argument 'courses' may not exactly match the expected type for setCoursesCount
      setCoursesCount(courses);

      // Fetch count of roadmaps (Roadmaps Created)
      const { count: roadmaps, error: roadmapsError } = await supabase
        .from("roadmaps")
        .select("*", { count: "exact", head: true });
      if (roadmapsError)
        console.error("Error fetching roadmaps count:", roadmapsError);
      // @ts-expect-error: Argument 'roadmaps' may not exactly match the expected type for setCoursesCount
      setRoadmapsCount(roadmaps);
    };

    fetchCounts();
  }, []);
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-purple-400" />,
      title: "Interactive Quiz System",
      description:
        "Generate custom quizzes on any topic with adjustable difficulty levels and detailed explanations.",
      link: "/quiz",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-purple-400" />,
      title: "Course Management",
      description:
        "Create and manage structured courses with chapter-based content and progress tracking.",
      link: "/courses",
    },
    {
      icon: <FileText className="h-10 w-10 text-purple-400" />,
      title: "Advanced PDF Tools",
      description:
        "Analyze PDFs interactively, generate quizzes from content, and manage your document library.",
      link: "/resources",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-purple-400" />,
      title: "PDF Chat",
      description:
        "Have interactive conversations with your PDF documents and get instant answers to your questions.",
      link: "/pdf-chat",
    },
    {
      icon: <Route className="h-10 w-10 text-purple-400" />,
      title: "Learning Roadmaps",
      description:
        "Follow structured learning paths with detailed guides for any technology or skill.",
      link: "/roadmaps",
    },
    {
      icon: <PencilRuler className="h-10 w-10 text-purple-400" />,
      title: "Interactive Notebooks",
      description:
        "Create and organize your notes with our interactive whiteboard system.",
      link: "/dashboard",
    },
    {
      icon: <Users className="h-10 w-10 text-purple-400" />,
      title: "Community Learning",
      description:
        "Connect with other learners, share knowledge, and learn together in our community.",
      link: "/community",
    },
    {
      icon: <GraduationCap className="h-10 w-10 text-purple-400" />,
      title: "Expert Guidance",
      description: "Get help from our community experts when you need it most.",
      link: "/community",
    },
  ];

  const benefits = [
    {
      icon: <Sparkles className="h-6 w-6 text-purple-400" />,
      title: "AI-Powered Learning",
      description:
        "Leverage advanced AI to generate quizzes, analyze documents, and create personalized learning paths.",
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-400" />,
      title: "Learn Faster",
      description:
        "Interactive tools and immediate feedback help you grasp concepts more quickly and effectively.",
    },
    {
      icon: <Target className="h-6 w-6 text-purple-400" />,
      title: "Stay Focused",
      description:
        "Structured courses and roadmaps keep you on track towards your learning goals.",
    },
    {
      icon: <Award className="h-6 w-6 text-purple-400" />,
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
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 text-white overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-0 opacity-30">
          {[...Array(20)].map((_, i) => (
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
                animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-purple-500/20 backdrop-blur-sm">
              <span className="flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Welcome to the Future of Learning
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 pb-4">
              Transform Your Learning Journey
            </h1>

            <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-gray-300 leading-relaxed">
              Experience the power of AI-driven education with interactive
              courses, smart tools, and a supportive community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 rounded-full"
                  >
                    <Link to="/roadmaps">Explore Roadmaps</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-purple-400 text-purple-400  rounded-full"
                  >
                    <Link to="/courses">Explore Courses</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 rounded-full"
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-purple-400 text-purple-400  rounded-full"
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
                  className="flex items-center gap-2 text-sm sm:text-base text-gray-300"
                >
                  <CheckCircle className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our comprehensive suite of learning tools designed to
              help you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-gray-800 hover:bg-gray-800/80 transition-all duration-300 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] overflow-hidden"
              >
                <Link to={feature.link}>
                  <CardHeader>
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff0a_1px,transparent_1px),linear-gradient(135deg,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of satisfied learners who have transformed their
              education journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {testimonial.role}
                      </CardDescription>
                    </div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Gradient Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Learnify?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the advantages of our modern learning platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="relative group p-8 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-800 hover:to-purple-900/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="bg-gray-800 rounded-xl p-3 w-fit mb-4 shadow-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-shadow">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                {profilesCount !== null ? profilesCount : "..."}
              </div>
              <p className="text-gray-400">Active Learners</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                {coursesCount !== null ? coursesCount : "..."}
              </div>
              <p className="text-gray-400">Courses Created</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                {roadmapsCount !== null ? roadmapsCount : "..."}
              </div>
              <p className="text-gray-400">Roadmaps Created</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                24/7
              </div>
              <p className="text-gray-400">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900/40 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already transforming their
            education with Learnify.
          </p>
          {user ? (
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 rounded-full"
            >
              <Link to="/dashboard" className="flex items-center">
                Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 rounded-full"
            >
              <Link to="/signup" className="flex items-center">
                Get Started for Free <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Add keyframes for floating animation */}

      <style
        // @ts-expect-error: 'jsx' prop not recognized by TypeScript for style tag, but needed for styled-jsx

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
