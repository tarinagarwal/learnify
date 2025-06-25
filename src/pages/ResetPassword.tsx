import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertDialog } from "../components/AlertDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Loader2 } from "lucide-react";
import { Translate } from "../components/Translate";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, title: "", message: "", type: "info" });

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token=")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        title: "Error",
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setAlert({
        show: true,
        title: "Success",
        message:
          "Password has been reset successfully. You can now login with your new password.",
        type: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
            <KeyRound className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center">
            <Translate>Reset Password</Translate>
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Enter your new password below
          </p>
        </div>

        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] backdrop-blur-sm border border-[hsl(var(--border))] rounded-xl p-6">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1"
              >
                <Translate>New Password</Translate>
              </label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[hsl(var(--input))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1"
              >
                <Translate>Confirm Password</Translate>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[hsl(var(--input))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                placeholder="Confirm new password"
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
              <Translate>Reset Password</Translate>
            </Button>
          </form>
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
