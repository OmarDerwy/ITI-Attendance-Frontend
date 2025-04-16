import { User } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, LoaderCircle, AlertCircle, Clock, HelpCircle } from "lucide-react";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { axiosBackendInstance } from "@/api/config";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentDetailProps {
  student: User;
  getFullName: (user: User) => string;
  getStatus: (user: User) => string;
  onClose: () => void;
  onRevoke: (studentId: number) => void;
  onResendActivation: (studentId: number) => void;
}

interface Schedule {
  id: number;
  name: string;
  created_at: string;
  track: {
    id: number;
    name: string;
  };
}

type AttendanceStatus =
  | "excused"
  | "pending"
  | "no_sessions"
  | "excused_late"
  | "absent"
  | "check-in"
  | "late-check-in_active"
  | "late-excused_active"
  | "no-check-out"
  | "late-check-in_no-check-out"
  | "late-excused_no-check-out"
  | "attended"
  | "late-check-in"
  | "late-excused"
  | "check-in_early-check-out"
  | "late-check-in_early-check-out"
  | "late-excused_early-check-out"
  | "check-in_early-excused"
  | "late-check-in_early-excused"
  | "late-excused_early-excused";

interface AttendanceRecordDetail {
  id: number;
  schedule: Schedule;
  sessions: string[];
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus;
  adjusted_time: string | null;
}

interface StudentInfo {
  id: number;
  name: string;
  email: string;
  track: string;
  is_active: boolean;
}

interface StudentHistoryResponse {
  student_info: StudentInfo;
  attendance_records: AttendanceRecordDetail[];
}

const fetchStudentHistory = async (studentId: number): Promise<StudentHistoryResponse> => {
  const response = await axiosBackendInstance.get(`/attendance/${studentId}/student-history/`);
  return response.data;
};

const StudentDetail = ({
  student,
  getFullName,
  getStatus,
  onClose,
  onRevoke,
  onResendActivation,
}: StudentDetailProps) => {
  const status = getStatus(student);

  const attendanceRate = student.attendance_rate ?? 85;
  const lastAttendanceDate = student.last_attendance_date ?? dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    error: historyError,
  } = useQuery<StudentHistoryResponse, Error>({
    queryKey: ['studentHistory', student.id],
    queryFn: () => fetchStudentHistory(student.id),
    enabled: !!student.id,
    refetchOnWindowFocus: false,
  });

  const getDisplayStatus = (apiStatus: AttendanceStatus): { icon: JSX.Element, text: string } => {
    switch (apiStatus) {
      case 'attended':
      case 'check-in':
        return { icon: <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />, text: "Attended" };
      case 'late-excused':
      case 'late-excused_active':
        return { icon: <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />, text: "Attended (Late, Excused)" };
      case 'check-in_early-excused':
      case 'late-check-in_early-excused':
      case 'late-excused_early-excused':
        return { icon: <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />, text: "Attended (Left Early, Excused)" };
      case 'absent':
        return { icon: <XCircle size={16} className="text-red-500 flex-shrink-0" />, text: "Absent" };
      case 'late-check-in':
      case 'late-check-in_active':
        return { icon: <Clock size={16} className="text-orange-500 flex-shrink-0" />, text: "Attended (Late)" };
      case 'no-check-out':
        return { icon: <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />, text: "Attended (No Check-out)" };
      case 'late-check-in_no-check-out':
      case 'late-excused_no-check-out':
        return { icon: <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />, text: "Attended (Late/No Check-out)" };
      case 'check-in_early-check-out':
      case 'late-check-in_early-check-out':
      case 'late-excused_early-check-out':
        return { icon: <Clock size={16} className="text-orange-500 flex-shrink-0" />, text: "Attended (Left Early)" };
      case 'excused':
        return { icon: <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />, text: "Excused (Absent)" };
      case 'excused_late':
        return { icon: <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />, text: "Excused (Late Arrival)" };
      case 'pending':
        return { icon: <LoaderCircle size={16} className="text-gray-500 flex-shrink-0 animate-spin" />, text: "Pending" };
      case 'no_sessions':
        return { icon: <HelpCircle size={16} className="text-blue-500 flex-shrink-0" />, text: "No Sessions Scheduled" };
      default:
        return { icon: <HelpCircle size={16} className="text-gray-500 flex-shrink-0" />, text: (apiStatus as string).replace(/_/g, ' ').replace(/-/g, ' ') };
    }
  };

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
            <div className="p-4 rounded-md border bg-background flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-1">Attendance Rate</p>
              <p>{attendanceRate}%</p>
            </div>
            <div className="p-4 rounded-md border bg-background flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-1">Last Attendance Date</p>
              <p>{lastAttendanceDate === 'N/A' ? 'N/A' : dayjs(lastAttendanceDate).format('DD MMM YYYY')}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Recent Attendance History</p>
            {isLoadingHistory ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : isErrorHistory ? (
              <div className="text-red-600 flex items-center gap-2 mt-2">
                <AlertCircle size={16} />
                <span>Error loading history: {historyError?.message || 'Unknown error'}</span>
              </div>
            ) : historyData && historyData.attendance_records.length > 0 ? (
              <div className="max-h-80 overflow-y-auto border rounded-md mt-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.attendance_records.map((record) => {
                      const displayStatus = getDisplayStatus(record.status);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{dayjs(record.schedule.created_at).format('DD MMM YYYY')}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              {displayStatus.icon}
                              <span className="capitalize">{displayStatus.text}</span>
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No attendance history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
