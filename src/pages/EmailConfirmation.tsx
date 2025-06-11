import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function EmailConfirmation() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.email_confirmed_at) {
          // Email is confirmed, show success state briefly before redirecting
          setVerifying(false);
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          // Check every 3 seconds for confirmation
          const interval = setInterval(async () => {
            const {
              data: { user: updatedUser },
            } = await supabase.auth.getUser();
            if (updatedUser?.email_confirmed_at) {
              clearInterval(interval);
              setVerifying(false);
              setTimeout(() => {
                navigate("/");
              }, 2000);
            }
          }, 3000);

          // Cleanup interval
          return () => clearInterval(interval);
        }
      } catch (error: unknown) {
        setError(error.message);
        setVerifying(false);
      }
    };

    checkEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 backdrop-blur-sm rounded-full mb-4">
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Verify Your Email
          </h1>
          <p className="mt-2 text-gray-400">
            Please check your email for a confirmation link
          </p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
          {verifying ? (
            <div className="space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-purple-400 animate-spin"></div>
                <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-purple-400" />
              </div>
              <p className="text-gray-300">Waiting for email confirmation...</p>
            </div>
          ) : error ? (
            <div className="text-red-400">
              <p>Error: {error}</p>
              <p className="mt-2 text-sm">
                Please try again or contact support.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-green-400">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Email confirmed!</p>
                <p className="mt-2 text-sm text-gray-400">
                  Redirecting you to the homepage...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
