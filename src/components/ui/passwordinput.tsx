import { useState, useEffect } from "react";
import { Eye, EyeOff, Sparkles, } from "lucide-react";
import { motion } from "framer-motion";
import zxcvbn from "zxcvbn";

const PasswordInput: React.FC<PasswordInputProps> = ({ password, setPassword }) => {

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  // Evaluate password strength on change
  useEffect(() => {
    const result = zxcvbn(password);
    setPasswordStrength(result.score); // score: 0–4
  }, [password]);

  // Generate random password
  const generatePassword = (
    length: number = 14,
    includeNumbers: boolean = true,
  ) => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      (includeNumbers ? "0123456789" : "") ;

    let generated = "";
    for (let i = 0; i < length; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setGeneratedPassword(generated);
  };

  const strengthColors: string[] = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-400",
    "bg-green-400",
    "bg-green-600",
  ];
  const strengthLabels: string[] = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
  ];

  return (
    <div className="relative">
      <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
        Password
      </label>
      <input
  id="password"
  type={showPassword ? "text" : "password"}
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="mt-1 block w-full bg-background border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
/>


      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-[35px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" color="#a21caf" />
        ) : (
          <Eye className="h-5 w-5" color="#a21caf" />
        )}
      </button>

      {/* Strength Meter */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(passwordStrength + 1) * 20}%` }}
        transition={{ duration: 0.4 }}
        className={`h-2 mt-2 rounded-full ${strengthColors[passwordStrength]}`}
      />
      <p className="text-xs mt-1 text-gray-400">
        Strength: <span className="font-semibold">{strengthLabels[passwordStrength]}</span>
      </p>

      {/* Generate Password */}
      <button
        type="button"
        onClick={() => generatePassword(14, true, true)}
        className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
      >
        <Sparkles className="h-4 w-4" /> Generate Strong Password 
      </button>
      {generatedPassword && (
        <button
          type="button"
          onClick={() => setPassword(generatedPassword)}
          className="mt-2 text-xs text-green-400 hover:text-purple-300 flex items-center gap-1"
        >
          <span className="text-xl">🎲</span>
          {generatedPassword}
        </button>
      )}
           
    </div>
  );
};

export default PasswordInput;
