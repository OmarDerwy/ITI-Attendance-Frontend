import { User } from "@/types/student";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";

interface StudentTableProps {
  students: User[];
  getFullName: (user: User) => string;
  getStatus: (user: User) => string;
  onViewDetails: (studentId: number) => void;
}

const StudentTable = ({ students, getFullName, getStatus, onViewDetails }: StudentTableProps) => {
  return (
    <div className="overflow-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-3 px-4 text-left font-medium">Name</th>
            <th className="py-3 px-4 text-left font-medium">Email</th>
            <th className="py-3 px-4 text-left font-medium">Track</th>
            <th className="py-3 px-4 text-left font-medium">Status</th>
            <th className="py-3 px-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-muted-foreground">
                No students found matching your search.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-muted/30">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{getFullName(student)}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{student.email}</td>
                <td className="py-3 px-4">
                  {student.tracks ? (
                    <span className="capitalize">{student.tracks}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Not assigned</span>
                  )}
                </td>
                <td className="py-3 px-4">
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
                </td>
                <td className="py-3 px-4 text-right">
                  {getStatus(student) === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDetails(student.id)}
                      >
                        Review
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(student.id)}
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
  );
};

export default StudentTable;
