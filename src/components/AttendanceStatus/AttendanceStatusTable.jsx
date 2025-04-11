import React, { useEffect } from 'react'
import { Calendar, Clock2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosBackendInstance } from '@/api/config';
import { toast } from '@/components/ui/use-toast';
// Function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'attended': return 'text-green-600 bg-green-100';
    case 'absent': return 'text-red-600 bg-red-100';
    case 'late': return 'text-orange-600 bg-orange-100';
    case 'excused': return 'text-yellow-600 bg-yellow-100';
    case 'excused but late': return 'text-orange-600 bg-orange-100';
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    default: return '';
  }
}

function AttendanceStatusTable({schedules, selectedTrackId}) {
  const [onViewDetails, setOnViewDetails] = useState(null)
  const [scheduleId, setScheduleId] = useState("")
  const isSchedulesEmpty = !schedules || schedules.length === 0
  const queryClient = useQueryClient();
  const [actionedStudent, setActionedStudent] = useState(null)
  
  // Reset the view details when track changes
  useEffect(() => {
    setOnViewDetails(null);
    setScheduleId("");
  }, [selectedTrackId]);

  //--------------------APIs---------------------//
  const fetchAttendanceStatus = async () => {
    const response = await axiosBackendInstance.get(`/attendance/schedules/${scheduleId}`);
    console.log('Attendance Status Response:', response.data);
    return response.data;
  };
  //----------------------------------------------//
  
  //------------------Queries-------------------//
  const { data: attendanceData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['attendanceStatus', scheduleId, selectedTrackId],
    enabled: !!scheduleId, // Only run the query if scheduleId is not null
    queryFn: fetchAttendanceStatus,
    refetchOnWindowFocus: false,
    staleTime: 0, // Don't use stale data
  });
  
  // Mutation for updating attendance status
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ attendanceRecordId, newStatus }) => {
      const endpoint = newStatus === 'attended' 
        ? `/attendance/${attendanceRecordId}/manual-attend/` 
        : `/attendance/${attendanceRecordId}/reset-attendance/`;
      
      const response = await axiosBackendInstance.patch(endpoint);
      return { attendanceRecordId, newStatus, response: response.data };
    },
    onMutate: async ({ attendanceRecordId, newStatus }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['attendanceStatus', scheduleId, selectedTrackId] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['attendanceStatus', scheduleId, selectedTrackId]);
      
      // Optimistically update the cache with the new status
      queryClient.setQueryData(['attendanceStatus', scheduleId, selectedTrackId], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          attendance_records: oldData.attendance_records.map(record => 
            record.id === attendanceRecordId 
              ? { ...record, status: newStatus }
              : record
          )
        };
      });
      
      return { previousData };
    },
    onSuccess: (data) => {
      console.log('Mutation success response:', data.response);
      
      toast({
        variant: "default",
        title: "Attendance Override",
        description: `Student status changed to ${data.newStatus}`,
      });

      // Update the cache with the actual response data
      queryClient.setQueryData(['attendanceStatus', scheduleId, selectedTrackId], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          attendance_records: oldData.attendance_records.map(record => 
            record.id === data.attendanceRecordId 
              ? { 
                  ...record, 
                  check_in_time: data.newStatus == 'attended'? data.response.check_in_time :data.response.current_check_in,
                  check_out_time: data.newStatus == 'attended'? data.response.check_out_time :data.response.current_check_out,
                  adjusted_time: data.response.adjusted_time
                }
              : record
          )
        };
      });
      
      // Force a refresh to ensure UI is updated with latest data
      refetch();
    },
    onError: (error, variables, context) => {
      // Rollback to the previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(['attendanceStatus', scheduleId, selectedTrackId], context.previousData);
      }
      
      console.error('Error changing attendance status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to change student status`,
      });
    }
  });

  // Function to handle attendance override
  const handleAttendanceOverride = (attendanceRecordId, currentStatus) => {
    setActionedStudent(attendanceRecordId);
    const newStatus = ['absent'].includes(currentStatus) ? 'attended' : 'absent';
    console.log(`Changing student ${attendanceRecordId} status from ${currentStatus} to ${newStatus}`);
    updateAttendanceMutation.mutate({ attendanceRecordId, newStatus });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    return dayjs(time).format("hh:mma");
  }

  return (
    <div className='overflow-auto rounded border'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b bg-muted/50'>
            <th className="py-3 px-4 text-left font-medium">Date</th>
            <th className="py-3 px-4 text-left font-medium">Time</th>
            <th className="py-3 px-4 text-left font-medium">Track</th>
            <th className="py-3 px-4 text-left font-medium">Sessions</th>
            <th className="py-3 px-4 text-left font-medium">Attended</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.data.length > 0 ? (
            schedules.data.map((schedule, index) => (
              <Fragment key={index}>
                <tr className='border-b'>
                  <td className="py-3 px-4">
                    <div className='flex items-center gap-2'>
                      <Calendar className='text-muted-foreground' />
                      <div><p className='font-medium'>{schedule?.created_at}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {formatTime(schedule.start_time)} / {formatTime(schedule.end_time)}
                  </td>
                  <td className="py-3 px-4">{schedule?.track.name}</td>
                  <td className="py-3 px-4">{schedule?.sessions.join(" - ")}</td>
                  <td className="py-3 px-4">{schedule?.attended_out_of_total.attended} / {schedule.attended_out_of_total.total}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOnViewDetails(onViewDetails === schedule.id ? null : schedule.id)
                        if (onViewDetails !== schedule.id) {
                          setScheduleId(schedule.id)
                          fetchAttendanceStatus()
                        } else {
                          setScheduleId("")
                        }
                      }}
                    >
                      {onViewDetails === schedule.id ? 'Close' : 'Details'}
                    </Button>
                  </td>
                </tr>

                {/* Expandable student attendance details */}
                {onViewDetails === schedule.id && (
                  <tr>
                    <td colSpan={6} className="p-2">
                      <Card className="bg-muted/20 p-4">
                        <h4 className="font-medium mb-2">Student Attendance</h4>
                        {isLoading ? (
                          <div className="flex items-center justify-center h-64">
                            <div className="animate-pulse flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Clock2 size={48}/>
                            </div>
                          </div>
                        ) : attendanceData && attendanceData.attendance_records ? (
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="py-2 px-3 text-left font-medium">Student</th>
                                <th className="py-2 px-3 text-left font-medium">Status</th>
                                <th className="py-2 px-3 text-left font-medium">Adjusted Time</th>
                                <th className="py-2 px-3 text-left font-medium">Check In/Out</th>
                                <th className="py-2 px-3 text-left font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceData.attendance_records.map((student) => (
                                <tr key={student.id} className={`border-b ${student.status === 'pending' ? 'bg-yellow-50' : ''}`}>
                                  <td className="py-2 px-3">{student.student.first_name} {student.student.last_name}</td>
                                  <td className="py-2 px-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                      {student.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3">
                                    {updateAttendanceMutation.isPending && actionedStudent == student.id ?  'loading...' : student.leave_request_status == 'approved'? student.adjusted_time ? formatTime(student.adjusted_time) : "N/A": "N/A"}
                                  </td>
                                  <td className="py-2 px-3">
                                    {updateAttendanceMutation.isPending && actionedStudent == student.id ? 'loading...' : student.check_in_time ? formatTime(student.check_in_time) : "N/A"} / {updateAttendanceMutation.isPending && actionedStudent == student.id ? 'loading...' : student.check_out_time ? formatTime(student.check_out_time) : "N/A"}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center space-x-2">
                                      {student.pending_leave_request === true && (
                                        <Link to="/leave-request-center" className="text-blue-600 hover:underline">
                                          Permission requested
                                        </Link>
                                      )}
                                      
                                      {/* Attendance override button */}
                                      { student.status !== 'pending' && <Button 
                                        size="xsm"
                                        variant={['absent'].includes(student.status) ? "default" : "outline"}
                                        className={['absent'].includes(student.status) 
                                          ? "bg-green-600 hover:bg-green-700" 
                                          : "border-red-600 text-red-600 hover:bg-red-50"}
                                        onClick={() => handleAttendanceOverride(student.id, student.status)}
                                      >
                                        {['absent'].includes(student.status) ? (
                                          <><CheckCircle className="h-4 w-4 ms-1" /> <p className='py-0.5 pr-2'>Force Attend</p></>
                                        ) : (
                                          <><XCircle className="h-4 w-4 ms-1" /> <p className='py-0.5 pr-2'>Force Absent</p></>
                                        )}
                                      </Button>}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-4">No attendance records available.</div>
                        )}
                      </Card>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))
          ) : (
            <tr className='border-b'>
              <td colSpan={6} className='text-center py-3'>No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceStatusTable