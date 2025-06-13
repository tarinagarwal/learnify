"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { UserPlus, Brain, Sparkles, Zap, Target, Award } from "lucide-react";
import PasswordInput from "../components/ui/passwordinput";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`,
        },
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error("No user returned from sign up");

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: user.id, name }]);

      if (profileError) throw profileError;

      navigate("/email-confirmation");
    } catch (error: unknown) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      title: "AI-Powered Learning",
    },
    {
      icon: <Zap className="h-5 w-5 text-primary" />,
      title: "Learn Faster",
    },
    {
      icon: <Target className="h-5 w-5 text-primary" />,
      title: "Stay Focused",
    },
    {
      icon: <Award className="h-5 w-5 text-primary" />,
      title: "Track Progress",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left side - Illustration/Info */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-primary/10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Animated particles */}
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
          <div className="max-w-md">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/20 backdrop-blur-sm p-4 rounded-full">
                <Brain className="w-16 h-16 text-primary" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
              Join the Future of Learning
            </h3>
            <p className="text-muted-foreground mb-8 text-center">
              Create your account and start your personalized learning journey
              today.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-card/30 backdrop-blur-sm p-4 rounded-lg border border-border flex items-center gap-3 hover:bg-card/50 transition-all duration-200"
                >
                  <div className="bg-primary/20 rounded-lg p-2 shadow-sm">
                    {benefit.icon}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    {benefit.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-primary/20 backdrop-blur-sm p-3 rounded-full">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Start your personalized learning journey
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
                  htmlFor="name"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full bg-input border border-border rounded-lg shadow-sm py-2 px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Email address
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
                <PasswordInput password={password} setPassword={setPassword} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 bg-input border-border rounded text-primary focus:ring-primary"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card/50 backdrop-blur-sm text-muted-foreground">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-primary bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  Sign in
                </Link>
              </div>
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
