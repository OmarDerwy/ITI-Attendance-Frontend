
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Password reset requested for:", email);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-60" />
      </div>
      
      <div className="w-full max-w-md animate-in slide-up fade-in duration-500">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              A
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Reset password</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email to receive a password reset link
          </p>
        </div>

        <Card className="overflow-hidden border shadow-lg">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/80" />
          <div className="p-6 sm:p-8">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 pl-10"
                    />
                  </div>
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
                      <span className="ml-2">Sending link...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 text-green-700 p-3 rounded-full">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-medium">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <span className="font-medium">{email}</span>. Please check your inbox and follow the instructions to reset your password.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-11 mt-4"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  <div className="flex items-center justify-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reset Password
                  </div>
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
