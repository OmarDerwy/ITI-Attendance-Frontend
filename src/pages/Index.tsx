import React, { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import AdminDashboard from "./Dashboard/AdminDashboard";
import SupervisorDashboard from "./Dashboard/SupervisorDashboard";
import StudentDashboard from "./Dashboard/StudentDashboard";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import BranchManagement from "./Management/BranchManagement";

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
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
      </Layout>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!userRole) return null;

  return (
 
    <>
     {userRole === "admin" && <BranchManagement />}
       <Layout>
     
      {userRole === "supervisor" && <SupervisorDashboard />} 
    </Layout>
     {userRole === "student" && <StudentDashboard />} 
    </>
  );
};

export default Index;
