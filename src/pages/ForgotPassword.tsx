import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertDialog } from "../components/AlertDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimerReset as KeyReset, ArrowLeft, Loader2 } from "lucide-react";
import { Translate } from "../components/Translate";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, title: "", message: "", type: "info" });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setAlert({
        show: true,
        title: "Success",
        message: "Password reset instructions have been sent to your email.",
        type: "success",
      });
      setEmail("");
    } catch (error: unknown) {
      setAlert({
        show: true,
        title: "Error",
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 backdrop-blur-sm rounded-full mb-4">
            <KeyReset className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            <Translate>Reset Password</Translate>
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Translate>
              Enter your email address and we'll send you instructions to reset
              your password.
            </Translate>
          </p>
        </div>

        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] backdrop-blur-sm border border-[hsl(var(--border))] rounded-xl p-6">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1"
              >
                <Translate>Email</Translate>
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[hsl(var(--input))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                placeholder="Enter your email"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              <Translate>Send Reset Instructions</Translate>
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <Translate>Back to Login</Translate>
            </Link>
          </div>
        </div>

        <AlertDialog
          isOpen={alert.show}
          onClose={() => setAlert({ ...alert, show: false })}
          title={alert.title}
          message={alert.message}
          type={alert.type}
        />
      </div>
    </div>
  );
}
