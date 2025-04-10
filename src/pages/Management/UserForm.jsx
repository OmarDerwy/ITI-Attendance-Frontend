import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageTitle from "../../components/ui/page-title";
import { axiosBackendInstance } from '@/api/config';

const UserForm = () => {
  const { userId } = useParams();
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState("supervisor");

  useEffect(() => {
    // if (userRole !== "admin") {
    //   toast({
    //     title: "Access Denied",
    //     description: "You do not have permission to access this page.",
    //     variant: "destructive",
    //   });
    //   navigate("/");
    //   return;
    // }

    const fetchUserData = async () => {
      try {
        if (userId && userId !== "add") {
          const userRes = await axiosBackendInstance.get(`/accounts/users/${userId}/`);
          const userData = userRes.data;
          setFirstName(userData.first_name || "");
          setLastName(userData.last_name || "");
          setEmail(userData.email || "");
          setPhoneNumber(userData.phone_number || "");
          setUserType(userData.is_admin ? "admin" : "supervisor");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again later.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [userId, userRole, navigate, toast]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      groups: [userType],
    };

    try {
      if (userId && userId !== "add") {
        await axiosBackendInstance.put(`/accounts/users/${userId}/`, userData);
        toast({
          title: "User Updated",
          description: `User ${firstName} ${lastName} has been updated successfully.`,
        });
      } else {
        await axiosBackendInstance.post("/accounts/users/", userData);
        toast({
          title: "User Added",
          description: `User ${firstName} ${lastName} has been added successfully.`,
        });
      }
      navigate("/users");
    } catch (error) {
      console.error("Error saving user:", error);
      
      // More specific error message if available
      const errorMessage = error.response?.data?.detail || 
                          "Failed to save user. Please try again later.";
                          
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6 min-h-screen">
        <div className="space-y-6">
          <PageTitle
            title={
              userId && userId !== "add" ? "Edit User" : "Add New User"
            }
            subtitle="Manage user information and access rights"
            icon={<User className="h-6 w-6" />}
          />

          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+20 1XX XXX XXXX"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>User Type</Label>
                  <RadioGroup
                    value={userType}
                    onValueChange={(value) => setUserType(value)}
                    className="flex items-center space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="supervisor" id="supervisor" />
                      <Label htmlFor="supervisor" className="cursor-pointer">
                        Supervisor
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="cursor-pointer">
                        Administrator
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => navigate("/users")}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Save User</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UserForm;
