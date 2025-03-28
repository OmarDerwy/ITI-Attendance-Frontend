
import { ReactNode, useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertType = "success" | "warning" | "error" | "info";

interface AlertToastProps {
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

const AlertToast = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: AlertToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  const closeToast = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(closeToast, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!isVisible) return null;

  const icons: Record<AlertType, ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const backgrounds: Record<AlertType, string> = {
    success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
    error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50",
    info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50",
  };

  const titles: Record<AlertType, string> = {
    success: title || "Success",
    warning: title || "Warning",
    error: title || "Error",
    info: title || "Information",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        backgrounds[type],
        isExiting ? "animate-fade-out" : "animate-fade-in"
      )}
      role="alert"
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium">{titles[type]}</p>
          {message && <p className="mt-1 text-sm text-foreground/80">{message}</p>}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md hover:text-foreground/60 focus:outline-none"
            onClick={closeToast}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertToast;
