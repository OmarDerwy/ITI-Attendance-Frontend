import React, { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import AdminDashboard from "./Dashboard/AdminDashboard";
import SupervisorDashboard from "./Dashboard/SupervisorDashboard";
import StudentDashboard from "./Dashboard/StudentDashboard";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { userRole, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !userRole) {
      navigate("/login");
    }
  }, [userRole, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Loading your dashboard...</h2>
          </Card>
        </div>
      </Layout>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!userRole) return null;

  return (
    <Layout>
      {/* {userRole === "admin" && <AdminDashboard />}
      {userRole === "supervisor" && <SupervisorDashboard />} */}
      {/* {userRole === "student" && <StudentDashboard />} */}
    </Layout>
  );
};

export default Index;
