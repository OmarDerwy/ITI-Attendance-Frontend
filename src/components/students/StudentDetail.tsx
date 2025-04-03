import { User } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

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
  const status = getStatus(student);
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Student Details</h3>
        <Badge 
          variant={
            status === "verified" ? "default" : 
            status === "rejected" ? "destructive" : 
            "outline"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      </div>
      
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
                    <p className="text-xs text-muted-foreground mb-1">Track</p>
                    <p>{student.tracks || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-72 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Account Information</h4>
            <div className="rounded-md border p-4 space-y-4">
              <div className="py-2">
                <p className="text-sm mb-1 font-medium">Status</p>
                <p className="text-sm">{status === "pending" ? "Awaiting Verification" : status}</p>
              </div>
              
              <div className="py-2">
                <p className="text-sm mb-1 font-medium">Registration Date</p>
                <p className="text-sm">Not available</p>
              </div>
              
              <Button 
                variant="ghost"
                className="w-full mt-2" 
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentDetail;
