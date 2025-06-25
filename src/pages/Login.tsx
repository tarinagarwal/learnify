"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LogIn, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Translate } from "../components/Translate";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Optional: Redirect if already logged in
  useEffect(() => {
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/");
    } catch (err) {
      console.error("Error checking session", err);
    }
  };

  checkSession();
}, [navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate("/");
    } catch (error: unknown) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:5173/", // Replace with your hosted URL
      },
    });
  };

  const highlights = [
    "Interactive learning experiences",
    "AI-powered content generation",
    "Personalized learning paths",
    "Expert community support",
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-primary/20 backdrop-blur-sm p-3 rounded-full">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
            <Translate>Welcome Back</Translate>
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Translate>Sign in to continue your learning journey</Translate>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card/50 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground"
                >

                  <Translate>Email</Translate>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-input border border-border rounded-lg shadow-sm py-2 px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="relative">

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-muted-foreground"
                >

                  <Translate>Password</Translate>
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full bg-input border border-border rounded-lg shadow-sm py-2 px-3 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
                <div
                  className="absolute right-3 top-[37px] cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 bg-input border-border rounded text-primary focus:ring-primary"
                  />

                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-muted-foreground"
                  >

                    <Translate>Remember me</Translate>
                  </label>
                </div>

                <div className="text-sm">

                  <Link
                    to="forgot-password"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >

                    <Translate>Forgot password?</Translate>
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? "Signing in..." : <Translate>Sign in</Translate>}
                </button>
              </div>
            </form>

            {/* OAuth separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/30 backdrop-blur-sm text-gray-400">
                  <Translate>or continue with</Translate>
                </span>
              </div>
            </div>

            {/* Google and GitHub Sign-In */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleOAuthLogin("google")}
                type="button"
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-2 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition"
              >
                <img
                  src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  alt="GitHub"
                  className="w-5 h-5 bg-white rounded-full"
                />
                <span>GitHub</span>
              </button>
            </div>


            {/* Signup link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card/50 backdrop-blur-sm text-muted-foreground">
                    <Translate>Don't have an account?</Translate>
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/signup"
                  className="w-full flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-primary bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  <Translate>Create an account</Translate>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Info */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">

        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-primary/10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-30">
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

        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
          <div className="max-w-md text-center">
            <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
              <Translate>Transform Your Learning Journey</Translate>
            </h3>
            <p className="text-muted-foreground mb-8">
              <Translate>
                Experience the power of AI-driven education with interactive
                courses, smart tools, and a supportive community.
              </Translate>
            </p>

            <div className="space-y-4">
              {highlights.map((highlight, index) => (

                <div
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />

                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
