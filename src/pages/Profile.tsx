import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertDialog } from "../components/AlertDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Key, Loader2, Eye, EyeOff } from "lucide-react";
import { Translate } from "../components/Translate";

export default function Profile() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
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
  }, [loadProfile]);

  const updateProfile = async () => {
    if (!name.trim()) {
      setAlert({ show: true, title: "Error", message: "Name cannot be empty.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
      if (error) throw error;

      setAlert({ show: true, title: "Success", message: "Profile updated successfully!", type: "success" });
    } catch (error: unknown) {
      setAlert({ show: true, title: "Error", message: error.message || "Unknown error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlert({ show: true, title: "Error", message: "All password fields are required.", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setAlert({ show: true, title: "Error", message: "Password should be at least 6 characters.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ show: true, title: "Error", message: "Passwords do not match.", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) throw new Error("Current password is incorrect.");

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");

      setAlert({ show: true, title: "Success", message: "Password updated successfully!", type: "success" });
    } catch (error: unknown) {
      setAlert({ show: true, title: "Error", message: error.message || "Unknown error", type: "error" });
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
          <h1 className="text-2xl font-bold mb-4 text-center">
            <Translate>Profile</Translate>
          </h1>
        </div>

        <div className="space-y-6">
          {/* Profile Info */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              <Translate>Profile Information</Translate>
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  <Translate>Name</Translate>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  <Translate>Email</Translate>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100"
                  disabled
                />
              </div>
              <Button
                onClick={updateProfile}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Translate>Update Profile</Translate>
              </Button>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              <Translate>Change Password</Translate>
            </h2>
            <div className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  <Translate>Current Password</Translate>
                </label>
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100 pr-10"
                />
                <div
                  className="absolute right-2 top-[33px] cursor-pointer text-gray-400 hover:text-gray-200"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {/* New Password */}
              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  <Translate>New Password</Translate>
                </label>
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100 pr-10"
                />
                <div
                  className="absolute right-2 top-[33px] cursor-pointer text-gray-400 hover:text-gray-200"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  <Translate>Confirm Password</Translate>
                </label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border-gray-600 text-gray-100 pr-10"
                />
                <div
                  className="absolute right-2 top-[33px] cursor-pointer text-gray-400 hover:text-gray-200"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
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
                <Translate>Change Password</Translate>
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
