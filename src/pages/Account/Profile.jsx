
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Camera, Save, Key, Eye, EyeOff } from "lucide-react";

const Profile = () => {
  const { userName, setUserName, userProfilePic, setUserProfilePic } = useUser();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileName, setProfileName] = useState(userName);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      // In a real app, this would handle actual file uploads
      const mockImageUrl = `https://source.unsplash.com/random/200x200?sig=${Date.now()}`;
      setUserProfilePic(mockImageUrl);
      setIsUploading(false);
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    }, 1500);
  };

  const handleSaveProfile = () => {
    setUserName(profileName);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleChangePassword = () => {
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

    // In a real app, this would send to your backend
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully.",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <img
                    src={userProfilePic}
                    alt={userName}
                    className="aspect-square h-full w-full"
                  />
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleImageUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Change Profile Picture"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value="johndoe@example.com"
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact an administrator to change your email address.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
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
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
