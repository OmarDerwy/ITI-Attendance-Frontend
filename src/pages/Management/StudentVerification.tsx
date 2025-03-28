
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { UserCheck, CheckCircle2, Search, User } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const StudentVerification = () => {
  const { userRole } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Mock student data
  const students = [
    { id: "1", name: "Alice Johnson", status: "pending", email: "alice@example.com", studentId: "ST20230001" },
    { id: "2", name: "Bob Smith", status: "verified", email: "bob@example.com", studentId: "ST20230002" },
    { id: "3", name: "Charlie Brown", status: "pending", email: "charlie@example.com", studentId: "ST20230003" },
    { id: "4", name: "Diana Ross", status: "rejected", email: "diana@example.com", studentId: "ST20230004" },
    { id: "5", name: "Edward Norton", status: "pending", email: "edward@example.com", studentId: "ST20230005" },
  ];

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerify = (studentId: string) => {
    toast({
      title: "Student Verified",
      description: "The student has been successfully verified.",
    });
    setSelectedStudent(null);
  };

  const handleReject = (studentId: string) => {
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

  return (
    <Layout>
      <PageTitle
        title="Student Verification"
        subtitle="Verify and manage student accounts"
        icon={<UserCheck />}
      />

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Pending: {students.filter(s => s.status === "pending").length}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Verified: {students.filter(s => s.status === "verified").length}
              </Badge>
            </div>
          </div>

          <div className="overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Name</th>
                  <th className="py-3 px-4 text-left font-medium">Student ID</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{student.studentId}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            student.status === "verified" ? "default" : 
                            student.status === "rejected" ? "destructive" : 
                            "outline"
                          }
                          className="capitalize"
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {student.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedStudent(student.id)}
                            >
                              Review
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedStudent(student.id)}
                          >
                            Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedStudent && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Student Details</h3>
            {(() => {
              const student = students.find(s => s.id === selectedStudent);
              if (!student) return null;
              
              return (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Personal Information</h4>
                        <div className="rounded-md border p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                              <p>{student.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Student ID</p>
                              <p>{student.studentId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Email</p>
                              <p>{student.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Status</p>
                              <Badge 
                                variant={
                                  student.status === "verified" ? "default" : 
                                  student.status === "rejected" ? "destructive" : 
                                  "outline"
                                }
                                className="capitalize"
                              >
                                {student.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Documents</h4>
                        <div className="rounded-md border p-4 h-48 flex items-center justify-center">
                          <p className="text-muted-foreground">Student documents would be displayed here</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-72 space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Verification</h4>
                      <div className="rounded-md border p-4 space-y-4">
                        {student.status === "pending" ? (
                          <>
                            <p className="text-sm">
                              Please review the student's information and documents before verification.
                            </p>
                            <div className="space-y-2">
                              <Button 
                                className="w-full" 
                                onClick={() => handleVerify(student.id)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Verify Student
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => handleReject(student.id)}
                              >
                                Reject
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full" 
                                onClick={() => setSelectedStudent(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="py-2">
                              <p className="text-sm mb-1 font-medium">Verification Status</p>
                              <Badge 
                                variant={student.status === "verified" ? "default" : "destructive"}
                                className="capitalize"
                              >
                                {student.status}
                              </Badge>
                            </div>
                            <div className="py-2">
                              <p className="text-sm mb-1 font-medium">Verification Date</p>
                              <p className="text-sm">June 15, 2023</p>
                            </div>
                            <div className="py-2">
                              <p className="text-sm mb-1 font-medium">Verified By</p>
                              <p className="text-sm">Admin User</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              className="w-full mt-4" 
                              onClick={() => setSelectedStudent(null)}
                            >
                              Close
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StudentVerification;
