import React from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
}) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    error: <XCircle className="w-6 h-6 text-destructive" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    info: <Info className="w-6 h-6 text-primary" />,
  };

  const containerStyles = {
    success: "bg-green-500/10 border-green-500/20",
    error: "bg-destructive/10 border-destructive/20", 
    warning: "bg-yellow-500/10 border-yellow-500/20",
    info: "bg-primary/10 border-primary/20",
  };

  const textStyles = {
    success: "text-green-600 dark:text-green-400",
    error: "text-destructive",
    warning: "text-yellow-600 dark:text-yellow-400", 
    info: "text-primary",
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`max-w-md w-full mx-4 p-6 rounded-xl shadow-xl border ${containerStyles[type]} bg-card/90 backdrop-blur-sm`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${textStyles[type]}`}>
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-primary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
