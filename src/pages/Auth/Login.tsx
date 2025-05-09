import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react"; // Removed UserCheck as it wasn't used
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { axiosBackendInstance } from "@/api/config";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authResponse = await axiosBackendInstance.post(
        "accounts/auth/jwt/create/",
        {
          email,
          password,
        }
      );

      // Store tokens properly
      const { access, refresh } = authResponse.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Get user info
      const userResponse = await axiosBackendInstance.get(
        "accounts/auth/users/me/"
      );
      const userData = userResponse.data;
      const userRole = userResponse.data.groups[0];
      user.setUserRole(userRole);

      // Fetch user profile to get first_name and last_name
      try {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL;
        const profileEndpoint = `${baseApiUrl}accounts/users/profile/`;
        const profileResponse = await axios.get(profileEndpoint, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        // Set user's full name if available
        if (profileResponse.data.first_name || profileResponse.data.last_name) {
          const fullName = `${profileResponse.data.first_name || ""} ${
            profileResponse.data.last_name || ""
          }`.trim();
          // Set the full name in context
          user.setUserFullName(fullName);
        }
      } catch (profileError) {
        console.error("Failed to fetch user profile details:", profileError);
        // Don't block login flow if profile fetch fails
      }

      // Fetch user profile picture
      try {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL;
        const photoGetEndpoint = `${baseApiUrl}accounts/users/photo/`;
        const profilePhotoResponse = await axios.get(photoGetEndpoint, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        if (profilePhotoResponse.data && profilePhotoResponse.data.photo_url) {
          user.setUserProfilePic(profilePhotoResponse.data.photo_url);
        }
      } catch (photoError) {
        console.error("Failed to fetch profile picture:", photoError);
        // Don't block login flow if photo fetch fails
      }

      //Check if user is a student and fetch track information
      if (userRole === "student") {
        try {
          const studentTrackResponse = await axiosBackendInstance.get(
            `attendance/students/by-user-id?userId=${Number(userData.id)}`
          );
          const trackData = studentTrackResponse.data;
          localStorage.setItem("studentTrack", JSON.stringify(trackData));
          user.setStudentTrack?.(trackData); // Optional chaining

          // Fetch attendance statistics for students
          try {
            const attendanceStats = await user.fetchAttendanceStats?.();
            if (attendanceStats) {
              // console.log("Attendance statistics loaded successfully");
            }
          } catch (statsError) {
            console.error("Failed to fetch attendance statistics:", statsError);
            // Don't block login flow if stats fetch fails
          }
        } catch (error) {
          console.error("Failed to fetch student track:", error);
          toast.error("Could not retrieve student track information");
        }
      }

      user.setUserName(userResponse.data.email);
      user.setUserId(userResponse.data.id);
      localStorage.setItem("userId", userData.id.toString());
      queryClient.refetchQueries();
      // console.log("User ID stored in localStorage:", userData.id); // Keep console logs minimal for production
      navigate("/");
      
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Wrong credentials or inactive user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Now with updated background effects */}
      <div className="hidden lg:flex min-h-screen w-1/2 items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4 border-r border-border/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl opacity-60" />
        </div>

        {/* Content with sequenced animations */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* Logo first (slides in from left) */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="/images/trackIt.png"
              alt="ITI Logo"
              className="login-logo w-110 h-32 object-contain mr-4 dark:hidden"
            />
            
            {/* Add colored text with ITI logo in dark mode */}
            <div className="login-logo hidden dark:flex items-center justify-center mr-4">
              <div className="flex items-center">
                {/* ITI Logo */}
                <img
                  src="/images/iti-logo.png"
                  alt="ITI Logo"
                  className="h-32 mr-2 mb-4"
                />

                {/* TrackIt text */}
                <span className="text-4xl mt-5">
                  <span
                    className="text-white font-bold"
                    style={{ fontFamily: '"Orgon W03 Medium", sans-serif' }}
                  >
                    Track
                  </span>
                  <span
                    className="text-primary font-bold"
                    style={{ fontFamily: '"Orgon W03 Medium", sans-serif' }}
                  >
                    It
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Knowledge City appears second */}
          <h2
            className="login-title text-4xl font-medium text-primary mb-4"
            style={{ fontFamily: '"Orgon W03 Medium", sans-serif' }}
          >
            Knowledge City
          </h2>
          
          {/* Track name appears third */}
          <p className="login-track text-xl text-muted-foreground mb-6">
            Track Full Stack using Python
          </p>
          
          {/* Description appears last */}
          <p className="login-description text-base text-muted-foreground/90 max-w-md">
            Streamline your experience with integrated tools for attendance management,
            lost & found items, leave request handling, insightful dashboards, and more.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Changed lg:text-left to text-center to keep it centered */}
          <div className="mb-8 text-center">
            {/* Optional: Smaller logo for mobile/right side */}
            <div className="flex items-center justify-center lg:hidden w-12 h-12 mx-auto mb-4 rounded-xl text-primary-foreground">
              <img
                src="/images/iti-logo.png"
                alt="logo"
                className="w-10 h-10"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Card className="overflow-hidden border shadow-lg">
            <div className="h-1 bg-gradient-to-r from-primary to-primary/80" />
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      to="/forget-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 font-medium transition-all duration-200 bg-primary hover:bg-primary/90",
                    isLoading && "opacity-90 cursor-not-allowed" // Added cursor style for disabled state
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="ml-2">Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
