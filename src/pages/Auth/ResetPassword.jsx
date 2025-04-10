import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { axiosBackendInstance } from '@/api/config';

// Password reset validation schema
const passwordResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const ResetPassword = () => {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Verify token and userId exist
    if (!userId || !token) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "Please request a new password reset link.",
      });
      navigate("/login");
    }
  }, [userId, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form input
      const result = passwordResetSchema.safeParse({ password, confirmPassword });
      
      if (!result.success) {
        const errors = {};
        result.error.errors.forEach(err => {
          errors[err.path[0]] = err.message;
        });
        setValidationErrors(errors);
        setIsLoading(false);
        return;
      }
      
      // Clear previous validation errors
      setValidationErrors({});
      
      // Simulate API call - replace with actual API call
      console.log("Password reset attempt with:", { userId, token, password });
      
      const response = await axiosBackendInstance.post("/accounts/reset-confirmation/", {
        userId,
        token,
        newPassword: password
      });
      
      // Simulate success
  
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      setIsLoading(false);
      navigate("/login");

    } catch (error) {
      console.error("Password reset failed:", error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "An error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl opacity-60" />
      </div>
      
      <div className="w-full max-w-md animate-in slide-up fade-in duration-500">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              A
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Reset Your Password</h1>
          <p className="mt-2 text-muted-foreground">
            Create a new password for your account
          </p>
        </div>

        <Card className="overflow-hidden border shadow-lg">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/80" />
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full h-11 font-medium transition-all duration-200 bg-primary hover:bg-primary/90", 
                  isLoading && "opacity-90"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-2">Resetting password...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="mr-2 h-4 w-4" />
                    Reset Password
                  </div>
                )}
              </Button>
            </form>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
