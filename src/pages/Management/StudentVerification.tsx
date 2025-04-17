import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { UserCheck, LoaderCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosBackendInstance } from "@/api/config";
import { User, ApiResponse } from "@/types/student";

// Import all the new smaller components
import SearchToolbar from "@/components/students/SearchToolbar";
import StudentTable from "@/components/students/StudentTable";
import AddStudentModal from "@/components/students/AddStudentModal";

const StudentVerification = () => {
  const { userRole } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [studentEntries, setStudentEntries] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Real student data from the server using tanstack query
  const fetchStudents = async () => {
    const response = await axiosBackendInstance.get('/accounts/students/', {
      params: { search: searchQuery, track: selectedTrack }
    });
    return response.data as ApiResponse;
  };

  const fetchTracks = async () => {
    const response = await axiosBackendInstance.get('/attendance/tracks/');
    return response.data;
  }

  // Load supervisor tracks as soon as page loads
  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: fetchTracks,
    refetchOnWindowFocus: false,
  });

  const { data: studentsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["students", searchQuery, selectedTrack],
    queryFn: fetchStudents,
    refetchOnWindowFocus: false,
  });

  
  useEffect(() => { // Initialize pagination data when studentsData is loaded
    if (studentsData) {
      setStudentEntries(studentsData.results);
      setNextPageUrl(studentsData.next);
    }
  }, [studentsData]);

  // Handle refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Success",
        description: "Student list has been refreshed.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh student list.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // New function: load more students
  const loadMoreStudents = async () => {
    if (!nextPageUrl) return;
    setIsLoadingMore(true);
    try {
      const response = await axiosBackendInstance.get(nextPageUrl);
      setStudentEntries(prev => [...prev, ...response.data.results]);
      setNextPageUrl(response.data.next);
    } catch (error) {
      console.error("Error loading more students:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Helper function to get status (you may need to adjust based on actual data structure)
  const getStatus = (user: User) => {
    if (user.is_active === undefined) return "pending";
    return user.is_active ? "verified" : "pending";
  };

  // Helper function to get full name
  const getFullName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  const handleRevoke = async (studentId: number) => {
    try {
      await axiosBackendInstance.patch(`/accounts/students/${studentId}/make-inactive/`);
      toast({
        title: "Student Revoked",
        description: "The student verification has been revoked.",
        variant: "destructive",
      });
      setSelectedStudent(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke student verification.",
        variant: "destructive",
      });
      console.error("Error revoking student:", error);
    }
  };

  const handleResendActivation = async (studentId: number) => {
    try{
      await axiosBackendInstance.get(`/accounts/students/${studentId}/resend-activation/`);
      toast({
        title: "Activation Email Resent",
        description: "The activation email has been resent to the student.",
      });
      console.log("Activation email resent successfully for student:", studentId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend activation email.",
        variant: "destructive",
      });
      console.error("Error resending activation email:", error);
    }
  }

  if (userRole !== "admin" && userRole !== "supervisor") {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </Card>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-500">Error loading students</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start">
          <PageTitle
            title="Student Verification"
            subtitle="Verify and manage student accounts"
            icon={<UserCheck />}
          />
          <div className="space-y-6 max-w-4xl">
            <Card className="p-6">
              <SearchToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                tracksData={tracksData}
                onTrackChange={setSelectedTrack}
                selectedTrack={selectedTrack}
                onAddStudent={() => setIsAddStudentModalOpen(true)}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                pendingCount={studentsData?.inactive_users}
                verifiedCount={studentsData?.active_users}
              />
              {isLoading ?
                (<Card className="p-8 text-center">
                  <h2 className="text-xl font-semibold mb-4">Loading students...</h2>
                </Card>
                ) : (<StudentTable
                  students={studentEntries}
                  getFullName={getFullName}
                  getStatus={getStatus}
                  onViewDetails={setSelectedStudent}
                  onViewDetailsValue={selectedStudent}
                  onRevoke={handleRevoke}
                  onResendActivation={handleResendActivation}
                />)}
              {/* Pagination: View More Button */}
              { isLoading || nextPageUrl && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreStudents}
                    disabled={isLoadingMore}
                    className="w-full max-w-xs"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle size={16} className="animate-spin" />
                        Loading more...
                      </span>
                    ) : "View More"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        open={isAddStudentModalOpen}
        onOpenChange={setIsAddStudentModalOpen}
        refetchStudents={refetch}
      />
    </Layout>
  );
};

export default StudentVerification;
