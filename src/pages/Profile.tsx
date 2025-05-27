import  { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertDialog } from "../components/AlertDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Key, Loader2 } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, title: "", message: "", type: "info" });

  // useCallback to memoize loadProfile and avoid useEffect dependency warning
  const loadProfile = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (profile?.name) setName(profile.name);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]); // added loadProfile here to fix react-hooks/exhaustive-deps warning

  const updateProfile = async () => {
    if (!name.trim()) {
      setAlert({
        show: true,
        title: "Error",
        message: "Name cannot be empty.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", user.id);

      if (error) throw error;

      setAlert({
        show: true,
        title: "Success",
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error: unknown) {
      // Type safe error handling
      let message = "An unknown error occurred.";
      if (error instanceof Error) message = error.message;

      setAlert({
        show: true,
        title: "Error",
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlert({
        show: true,
        title: "Error",
        message: "All password fields are required.",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      setAlert({
        show: true,
        title: "Error",
        message: "Password should be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        title: "Error",
        message: "New passwords do not match.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Re-authenticate user with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");

      setAlert({
        show: true,
        title: "Success",
        message: "Password updated successfully!",
        type: "success",
      });
    } catch (error: unknown) {
      let message = "An unknown error occurred.";
      if (error instanceof Error) message = error.message;

      setAlert({
        show: true,
        title: "Error",
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 backdrop-blur-sm rounded-full mb-4">
            <UserCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Profile Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
              <Button
                onClick={updateProfile}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Update Profile
              </Button>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
              <Button
                onClick={updatePassword}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Update Password
              </Button>
            </div>
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
