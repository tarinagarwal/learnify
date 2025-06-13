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
      icon: <Sparkles className="h-5 w-5 text-purple-400" />,
      title: "AI-Powered Learning",
    },
    {
      icon: <Zap className="h-5 w-5 text-purple-400" />,
      title: "Learn Faster",
    },
    {
      icon: <Target className="h-5 w-5 text-purple-400" />,
      title: "Stay Focused",
    },
    {
      icon: <Award className="h-5 w-5 text-purple-400" />,
      title: "Track Progress",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Left side - Illustration/Info */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-purple-900/30">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff0a_1px,transparent_1px),linear-gradient(135deg,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155
                  }, 255, ${Math.random() * 0.5 + 0.5})`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${Math.random() * 100 + 155
                  }, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5 + 0.5
                  })`,
                animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
          <div className="max-w-md">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-500/20 backdrop-blur-sm p-4 rounded-full">
                <Brain className="w-16 h-16 text-purple-400" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              Join the Future of Learning
            </h3>

            <p className="text-gray-300 mb-8 text-center">
              Create your account and start your personalized learning journey
              today.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg border border-gray-700 flex items-center gap-3"
                >
                  <div className="bg-gray-800 rounded-lg p-2 shadow-sm">
                    {benefit.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-200">
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
            <div className="bg-purple-500/20 backdrop-blur-sm p-3 rounded-full">
              <UserPlus className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Start your personalized learning journey
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800/30 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <PasswordInput password={password} setPassword={setPassword} />
                <p className="mt-1 text-xs text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-300"
                >
                  I agree to the{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800/30 backdrop-blur-sm text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-purple-400 bg-gray-800/30 backdrop-blur-sm hover:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
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
