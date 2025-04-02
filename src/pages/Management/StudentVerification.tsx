import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { UserCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosBackendInstance } from "@/api/config";
import { User, ApiResponse } from "@/types/student";

// Import all the new smaller components
import SearchToolbar from "@/components/students/SearchToolbar";
import StudentTable from "@/components/students/StudentTable";
import StudentDetail from "@/components/students/StudentDetail";
import AddStudentModal from "@/components/students/AddStudentModal";

const StudentVerification = () => {
  const { userRole } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real student data from the server using tanstack query
  const fetchStudents = async () => {
    const response = await axiosBackendInstance.get('/accounts/students/');
    return response.data as ApiResponse;
  };

  const { data: studentsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    refetchOnWindowFocus: false,
  });

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

  // Get the actual students array from the response
  const students = studentsData?.results || [];

  // Filter students - using the actual API data structure
  const filteredStudents = students.filter(student => 
    (student.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.first_name && student.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.last_name && student.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter students who are part of the student group
  const studentUsers = students.filter(user => user.groups.includes("student"));

  // Helper function to get status (you may need to adjust based on actual data structure)
  const getStatus = (user: User) => {
    if (user.is_active === undefined) return "pending";
    return user.is_active ? "verified" : "rejected";
  };

  // Helper function to get full name
  const getFullName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  const handleVerify = (studentId: number) => {
    toast({
      title: "Student Verified",
      description: "The student has been successfully verified.",
    });
    setSelectedStudent(null);
  };

  const handleReject = (studentId: number) => {
    toast({
      title: "Student Rejected",
      description: "The student verification has been rejected.",
      variant: "destructive",
    });
    setSelectedStudent(null);
  };

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

  if (isLoading) {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Loading students...</h2>
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
      <PageTitle
        title="Student Verification"
        subtitle="Verify and manage student accounts"
        icon={<UserCheck />}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <SearchToolbar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddStudent={() => setIsAddStudentModalOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            pendingCount={studentUsers.filter(s => getStatus(s) === "pending").length}
            verifiedCount={studentUsers.filter(s => getStatus(s) === "verified").length}
          />

          <StudentTable 
            students={filteredStudents}
            getFullName={getFullName}
            getStatus={getStatus}
            onViewDetails={setSelectedStudent}
          />
        </Card>

        {/* Student Detail View */}
        {selectedStudent && (
          <>
            {(() => {
              const student = students.find(s => s.id === selectedStudent);
              if (!student) return null;
              
              return (
                <StudentDetail 
                  student={student}
                  getFullName={getFullName}
                  getStatus={getStatus}
                  onClose={() => setSelectedStudent(null)}
                  onVerify={handleVerify}
                  onReject={handleReject}
                />
              );
            })()}
          </>
        )}
      </div>

      {/* Add Student Modal */}
      <AddStudentModal 
        open={isAddStudentModalOpen}
        onOpenChange={setIsAddStudentModalOpen}
      />
    </Layout>
  );
};

export default StudentVerification;
