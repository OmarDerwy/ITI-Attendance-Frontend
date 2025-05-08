import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { axiosBackendInstance } from "@/api/config";

const CoordinatorForm = () => {
  const { coordinatorId } = useParams();
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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

    const fetchCoordinatorData = async () => {
      try {
        if (coordinatorId && coordinatorId !== "add") {
          const userRes = await axiosBackendInstance.get(
            `/accounts/coordinators/${coordinatorId}/`
          );
          const userData = userRes.data;
          setFirstName(userData.first_name || "");
          setLastName(userData.last_name || "");
          setEmail(userData.email || "");
          setPhoneNumber(userData.phone_number || "");
        }
      } catch (error) {
        console.error("Error fetching coordinator data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch coordinator data. Please try again later.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchCoordinatorData();
  }, [coordinatorId, userRole, navigate, toast]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async () => {
    if (!firstName || !email) {
      toast({
        title: "Validation Error",
        description: "First name and email are required.",
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

    const coordinatorData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      groups: ["coordinator"], // Set the user type to coordinator
    };

    try {
      if (coordinatorId && coordinatorId !== "add") {
        await axiosBackendInstance.patch(
          `/accounts/coordinators/${coordinatorId}/`,
          coordinatorData
        );
        toast({
          title: "Coordinator Updated",
          description: `Coordinator ${firstName} ${lastName} has been updated successfully.`,
        });
      } else {
        await axiosBackendInstance.post("/accounts/users/", coordinatorData);
        toast({
          title: "Coordinator Added",
          description: `Coordinator ${firstName} ${lastName} has been added successfully.`,
        });
      }
      navigate("/coordinators");
    } catch (error) {
      console.error("Error saving coordinator:", error);

      // More specific error message if available
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to save coordinator. Please try again later.";

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
        <div className="space-y-6 max-w-3xl mx-auto">
          <PageTitle
            title={coordinatorId && coordinatorId !== "add" ? "Edit Coordinator" : "Add New Coordinator"}
            subtitle="Manage coordinator information"
            icon={<Users className="h-6 w-6" />}
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
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+20 1XX XXX XXXX"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => navigate("/coordinators")}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Save Coordinator</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CoordinatorForm;