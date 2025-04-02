import { User } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface StudentDetailProps {
  student: User;
  getFullName: (user: User) => string;
  getStatus: (user: User) => string;
  onClose: () => void;
  onVerify: (studentId: number) => void;
  onReject: (studentId: number) => void;
}

const StudentDetail = ({
  student,
  getFullName,
  getStatus,
  onClose,
  onVerify,
  onReject,
}: StudentDetailProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Student Details</h3>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Personal Information</h4>
              <div className="rounded-md border p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                    <p>{getFullName(student)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p>{student.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <p>{student.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge 
                      variant={
                        getStatus(student) === "verified" ? "default" : 
                        getStatus(student) === "rejected" ? "destructive" : 
                        "outline"
                      }
                      className="capitalize"
                    >
                      {getStatus(student)}
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
              {getStatus(student) === "pending" ? (
                <>
                  <p className="text-sm">
                    Please review the student's information and documents before verification.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => onVerify(student.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify Student
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => onReject(student.id)}
                    >
                      Reject
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={onClose}
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
                      variant={getStatus(student) === "verified" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {getStatus(student)}
                    </Badge>
                  </div>
                  <div className="py-2">
                    <p className="text-sm mb-1 font-medium">Verification Date</p>
                    <p className="text-sm">Not available</p>
                  </div>
                  <div className="py-2">
                    <p className="text-sm mb-1 font-medium">Verified By</p>
                    <p className="text-sm">Not available</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4" 
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentDetail;
