import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Key, Eye, EyeOff, Pencil } from "lucide-react";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dha2yp5tj";
const CLOUDINARY_UPLOAD_PRESET = "my_upload_preset";

const Profile = () => {
  const { userName, setUserName, userProfilePic, setUserProfilePic } =
    useUser();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileName, setProfileName] = useState(userName);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // File input reference to trigger it programmatically
  const fileInputRef = useRef(null);

  // Fetch the user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL;
        const profileEndpoint = `${baseApiUrl}accounts/users/profile/`;
        const response = await axios.get(profileEndpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        setUserProfile(response.data);

        // Set the profile name based on first_name and last_name
        if (response.data.first_name || response.data.last_name) {
          const fullName = `${response.data.first_name || ""} ${
            response.data.last_name || ""
          }`.trim();
          setProfileName(fullName);
          // Update the userName in context if needed
          setUserName(fullName);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Add back the separate useEffect for fetching profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL;
        const photoGetEndpoint = `${baseApiUrl}accounts/users/photo/`;
        const response = await axios.get(photoGetEndpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        if (response.data && response.data.photo_url) {
          // Only update the profile picture in context/avatar
          setUserProfilePic(response.data.photo_url);
        }
      } catch (error) {
        console.error("Failed to fetch profile picture:", error);
        // Don't show an error toast since this is just initializing the UI
      }
    };

    fetchProfilePicture();
  }, []);

  // Upload image to Cloudinary - adapted from ImageUploadField
  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Validate file size and type
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      toast({
        title: "Uploading Profile Picture",
        description: "Please wait while we upload your image...",
      });

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Now update the profile photo in the backend
      await handleImageUploaded(cloudinaryUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  const handleImageUploaded = async (cloudinaryUrl) => {
    if (!cloudinaryUrl) return;

    setIsUploading(true);

    try {
      const baseApiUrl = import.meta.env.VITE_API_BASE_URL;
      const photoUpdateEndpoint = `${baseApiUrl}accounts/users/update-photo/`;

      const response = await axios.post(
        photoUpdateEndpoint,
        {
          photo_url: cloudinaryUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setUserProfilePic(cloudinaryUrl);

      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile picture:", error);

      toast({
        title: "Update Failed",
        description:
          error.response?.data?.detail ||
          "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation password must match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const baseApiUrl = import.meta.env.VITE_API_BASE_URL;
      const passwordChangeEndpoint = `${baseApiUrl}accounts/users/change-password/`;

      const response = await axios.post(
        passwordChangeEndpoint,
        {
          old_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to change password:", error);

      toast({
        title: "Password Change Failed",
        description:
          error.response?.data?.detail ||
          "Please check your current password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Layout>
      <PageTitle
        title="Profile"
        subtitle="Manage your account information and settings"
        icon={<User />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Personal Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your profile information
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <img
                    src={userProfilePic}
                    alt={userName}
                    className="aspect-square h-full w-full object-cover"
                  />
                  {/* Pen icon appears on hover */}
                  <div
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={openFileSelector}
                  >
                    {isUploading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Pencil className="h-6 w-6 text-white" />
                    )}
                  </div>
                </Avatar>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Hover over your picture and click to change it
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileName}
                disabled
                className="bg-muted cursor-not-allowed opacity-80"
              />
              <p className="text-xs text-muted-foreground">
                Your full name is displayed here.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userProfile ? userProfile.email : "Loading..."}
                disabled
                className="bg-muted cursor-not-allowed opacity-80"
              />
              <p className="text-xs text-muted-foreground">
                Contact an administrator to change your email address.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Security</h3>
            <p className="text-sm text-muted-foreground">
              Update your password and security settings
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleChangePassword}
              className="ml-auto"
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                isChangingPassword
              }
            >
              {isChangingPassword ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Changing...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
