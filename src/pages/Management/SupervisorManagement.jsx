
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import InstructorForm from "@/components/instructors/InstructorForm";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { User, Users } from "lucide-react";

// Mock data for tracks
const mockTracks = [
  { id: "1", name: "Web Development", location: "Building A" },
  { id: "2", name: "Mobile Development", location: "Building B" },
  { id: "3", name: "Data Science", location: "Building C" },
  { id: "4", name: "UI/UX Design", location: "Building D" },
  { id: "5", name: "DevOps", location: "Building E" }
];

const SupervisorManagement = () => {
  const [tracks, setTracks] = useState([]);
  const { userRole } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin, redirect otherwise
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    // Fetch tracks - in a real app, this would be an API call
    // For now, using mock data
    setTracks(mockTracks);
  }, [userRole, navigate]);

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supervisor Management</h1>
            <p className="mt-2 text-muted-foreground">
              Add new supervisors to your academy and assign them to tracks.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">Add New Supervisor</h2>
          <InstructorForm tracks={tracks} />
        </div>
      </div>
    </Layout>
  );
};

export default SupervisorManagement;
