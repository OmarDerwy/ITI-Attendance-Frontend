import { User } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentDetailProps {
  student: User;
  getFullName: (user: User) => string;
  getStatus: (user: User) => string;
  onClose: () => void;
  onRevoke: (studentId: number) => void;
  onResendActivation: (studentId: number) => void;
}

// Define a type for attendance history records if not already defined elsewhere
interface AttendanceRecord {
  date: string;
  status: "present" | "absent";
}

const StudentDetail = ({
  student,
  getFullName,
  getStatus,
  onClose,
  onRevoke,
  onResendActivation,
}: StudentDetailProps) => {
  const status = getStatus(student);

  // --- Mock Data Augmentation ---
  const attendanceRate = student.attendance_rate ?? 85; // Mock rate if undefined
  const lastAttendanceDate = student.last_attendance_date ?? dayjs().subtract(1, 'day').format('YYYY-MM-DD'); // Mock date if undefined
  const attendanceHistory: AttendanceRecord[] = student.attendance_history ?? [ // Mock history if undefined
    { date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), status: 'present' },
    { date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), status: 'present' },
    { date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'), status: 'absent' },
    { date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'), status: 'present' },
    { date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'), status: 'present' },
  ];
  // --- End Mock Data ---

  return (
    <div className="p-6 bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Student Details</h3>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Personal Information</h4>
              <div className="rounded-md border bg-background p-4 space-y-4 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-8">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                    <p>{getFullName(student)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="overflow-hidden">{student.email}</p>
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

          <div className="w-full md:w-80 space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Account Information</h4>
            <div className="rounded-md border bg-background p-4 grid grid-cols-2 gap-4">
              <div className="py-2">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Registeration Date</p>
                <p className="text-sm">{dayjs(student.date_joined).format('DD/MM/YYYY hh:mma')}</p>
              </div>
              <div className="py-2">
                <p className="text-xs text-muted-foreground ms-2 mb-1 font-medium">Status</p>
                <Badge
                  variant={
                    status === "verified" ? "default" :
                    status === "pending" ? "secondary" :
                    "outline"
                  }
                  className="capitalize"
                >
                  {status}
                </Badge>
              </div>
              

              <Button
                variant="outline"
                className="w-full text-wrap"
                onClick={() => {onResendActivation(student.id)}}
                disabled={status !== "pending"}
              >
                Resend Activation
              </Button>

              <Button
                variant="destructive"
                className="w-full text-wrap"
                onClick={() => {onRevoke(student.id)}}
                disabled={status == "pending"}
              >
                Revoke Verification
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-1">Attendance Information</h4>
        <div className="rounded-md border bg-background p-4 space-y-4 overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Attendance Rate</p>
              <p>{attendanceRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Attendance Date</p>
              <p>{lastAttendanceDate === 'N/A' ? 'N/A' : dayjs(lastAttendanceDate).format('DD MMM YYYY')}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Recent Attendance History</p>
            {attendanceHistory.length > 0 ? (
              <div className="max-h-80 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dayjs(record.date).format('DD MMM YYYY')}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            {record.status === "present" ? (
                              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle size={16} className="text-red-500 flex-shrink-0" />
                            )}
                            <span className="capitalize">{record.status}</span>
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attendance history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
