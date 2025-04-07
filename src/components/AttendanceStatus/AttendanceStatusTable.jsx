import React from 'react'
import { Calendar, Clock2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { axiosBackendInstance } from '@/api/config';

// //mock data for attendance status with students
// const schedules = [
//     {
//         date: '2023-10-01',
//         fromto: '10:00AM/1:00PM',
//         sessions: 'Flask, Flask lab',
//         students: [
//             { id: 1, name: 'John Doe', status: 'attended', adjustedTime: 'N/A', checkinout: '10:00AM/-' },
//             { id: 2, name: 'Jane Smith', status: 'absent', adjustedTime: 'N/A', checkinout: 'N/A' },
//             { id: 3, name: 'Mike Brown', status: 'late', adjustedTime: 'N/A', checkinout: '10:30AM/1:00PM' },
//             { id: 4, name: 'Sarah Wilson', status: 'excused', adjustedTime: 'all day', checkinout: 'N/A' },
//             { id: 5, name: 'Alex Johnson', status: 'excused but late', adjustedTime: '11:00 AM', checkinout: '11:00AM/1:00PM' },
//             { id: 6, name: 'Emma Davis', status: 'pending', adjustedTime: '10:30 AM', requestType: 'late', checkinout: 'N/A' }
//         ]
//     },
//     {
//         date: '2023-10-02',
//         fromto: '9:00AM/12:00PM',
//         sessions: 'Django, Django lab',
//         students: [
//             { id: 1, name: 'John Doe', status: 'attended', adjustedTime: 'N/A', checkinout: '9:00AM/12:00PM' },
//             { id: 2, name: 'Jane Smith', status: 'attended', adjustedTime: 'N/A', checkinout: '9:00AM/12:00PM' },
//             { id: 3, name: 'Mike Brown', status: 'pending', adjustedTime: 'all day', requestType: 'absence', checkinout: 'N/A' },
//             { id: 4, name: 'Sarah Wilson', status: 'attended', adjustedTime: 'N/A', checkinout: '9:00AM/12:00PM' }
//         ]
//     },
//     {
//         date: '2023-10-03',
//         fromto: '10:00AM/2:00PM',
//         sessions: 'AI Session',
//         students: [
//             { id: 1, name: 'John Doe', status: 'attended', adjustedTime: 'N/A', checkinout: '10:00AM/2:00PM' },
//             { id: 2, name: 'Jane Smith', status: 'attended', adjustedTime: 'N/A', checkinout: '10:00AM/2:00PM' },
//             { id: 3, name: 'Mike Brown', status: 'attended', adjustedTime: 'N/A', checkinout: '10:15AM/2:00PM' }
//         ]
//     }
// ]

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

function AttendanceStatusTable(schedules) {
  const [onViewDetails, setOnViewDetails] = useState(null)
  const [scheduleId, setScheduleId] = useState("")
  const isSchedulesEmpty = false
  console.log('schedules', schedules, 'isSchedulesEmpty', isSchedulesEmpty)
  //--------------------APIs---------------------//
    // api for fetching student attendance status for each given day
  const fetchAttendanceStatus = async () => {
    const response  = await axiosBackendInstance.get(`/attendance/schedules/${scheduleId}`, );
    console.log('Attendance Status Response:', response.data);
    return response.data;
  };
  //----------------------------------------------//
  //------------------Queries-------------------//
    const { data: attendanceData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['attendanceStatus', scheduleId],
    enabled: !!scheduleId, // Only run the query if scheduleId is not null
    queryFn: fetchAttendanceStatus,
    refetchOnWindowFocus: false,
  });
  //----------------------------------------------//

  const formatTime = (time) => {
    // Try to parse using common time formats then format to "hh:mm A"
    return dayjs(time, ['h:mm A',]).format('hh:mm A');
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
                      <div><p className='font-medium'>{schedule.created_at}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {formatTime(schedule.start_time)} / {formatTime(schedule.end_time)}
                  </td>
                  <td className="py-3 px-4">{schedule.track.name}</td>
                  <td className="py-3 px-4">{schedule.sessions.join(" - ")}</td>
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
                    <td colSpan={5} className="p-2">
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
                                  <td className="py-2 px-3">{student.adjusted_time ? student.adjusted_time : "N/A"}</td>
                                  <td className="py-2 px-3">{student.check_in_time ? student.check_in_time : "N/A"} / {student.check_out_time ? student.check_out_time : "N/A"}</td>
                                  <td className="py-2 px-3">
                                    {student.status === 'pending' && (
                                      <Link to="/leave-request-center" className="text-blue-600 hover:underline">
                                        Permission requested
                                      </Link>
                                    )}
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
              <td colSpan={5} className='text-center py-3'>No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceStatusTable