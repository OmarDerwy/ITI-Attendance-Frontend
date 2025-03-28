
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleResendOTP = () => {
    setCountdown(60);
    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent to your email.",
    });
  };
  
  const handleVerify = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      
      if (otp === "123456") { // For demo purposes
        toast({
          title: "Verification Successful",
          description: "You have been successfully verified.",
        });
        navigate("/");
      } else {
        toast({
          title: "Invalid Code",
          description: "The code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-70" />
        <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-primary/5 to-transparent opacity-70" />
      </div>
      
      <div className="w-full max-w-md p-4 animate-in slide-up fade-in duration-500">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold">Two-Factor Authentication</h1>
          <p className="mt-2 text-muted-foreground">
            Enter the verification code sent to your email
          </p>
        </div>

        <Card className="overflow-hidden border shadow-lg">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/80" />
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex justify-center w-full my-4">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    render={({ slots }) => (
                      <InputOTPGroup>
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} index={index} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Didn't receive a code? {countdown > 0 ? (
                    <span>Resend in {countdown}s</span>
                  ) : (
                    <button 
                      onClick={handleResendOTP}
                      className="text-primary hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
              </div>
              
              <Button
                onClick={handleVerify}
                className="w-full"
                disabled={otp.length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  <div className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Verify
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OtpVerification;
