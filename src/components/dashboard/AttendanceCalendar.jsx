import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import axios from 'axios';
import { axiosBackendInstance } from '@/api/config';
import { useUser } from '@/context/UserContext';

const AttendanceCalendar = () => {
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { studentTrack } = useUser();

  // Memoize fetchAttendanceData
  const fetchAttendanceData = useMemo(() => async () => {
    try {
      setIsLoading(true);
      const response = await axiosBackendInstance.get('attendance/student-attendance-summary/');
      // Process the data into the format needed for the calendar
      const processedData = {};
      response.data.forEach(item => {
        processedData[item.date] = item.status;
      });
      
      setAttendanceData(processedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);
  
  // Get 6 months starting from join date
  const getMonthsFromJoinDate = () => {
    const months = [];
    
    // Default to current date if studentTrack isn't loaded yet
    const joinDate = studentTrack?.track?.start_date 
      ? new Date(studentTrack.track.start_date) 
      : new Date();
    let monthsToShow = 6;
    if (studentTrack?.track?.program_type === 'intensive') {
      monthsToShow = 6;
    } else {
      monthsToShow = 9;
    }
    // Always show monthsToShow starting from join date
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(joinDate);
      date.setMonth(joinDate.getMonth() + i);
      months.push({
        name: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }
    
    return months;
  };
  
  const calendarMonths = getMonthsFromJoinDate();
  
  // Returns the appropriate class based on attendance status
  const getStatusClass = (status) => {
    // Attended statuses - Green
    if ([
      'attended', 
      'check-in',
      'check-in_early-check-out',
      'late-check-in_early-excused',
      'check-in_early-excused',
    ].includes(status)) {
      return 'bg-green-500';
    } 
    // Absent statuses - Red
    else if (status === 'absent') {
      return 'bg-red-500';
    } 
    else if ('late-check-in_early-check-out'
      , 'late-check-in_no-check-out'
      ,  'late-check-in'.includes(status)) {
      return 'bg-pink-500';
    }
    // Excused statuses - Blue
    else if ([
      'excused', 
      'excused_late', 
     
    ].includes(status)) {
      return 'bg-blue-500';
    }
    // No-check-out statuses - Orange
    else if ([
      'no-check-out',
     
    ].includes(status)) {
      return 'bg-orange-500';
    }
    else if (status === 'check_in_active') {
      
    // Default - White/bordered
    }
    else {
      return 'bg-green border border-green-200';
    }
  };

  // Function to generate calendar data for each month
  const generateMonthCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Initialize days array with empty days
    const days = Array(firstDay).fill(null);
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateString = dateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      days.push({
        day: i,
        status: attendanceData[dateString] || null
      });
    }
    
    // Organize into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    // If the last week is not complete, pad with null
    const lastWeek = weeks[weeks.length - 1];
    if (lastWeek && lastWeek.length < 7) {
      const padding = Array(7 - lastWeek.length).fill(null);
      weeks[weeks.length - 1] = [...lastWeek, ...padding];
    }
    
    return weeks;
  };

  // Group months into rows (3 months per row)
  const monthRows = [];
  for (let i = 0; i < calendarMonths.length; i += 3) {
    monthRows.push(calendarMonths.slice(i, i + 3));
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold leading-none tracking-tight">Attendance Calendar</h2>
        </div>
        
        {isLoading ? (
                   <div className="flex flex-col items-center justify-center py-12">
                     <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                     <p className="text-muted-foreground">Loading data...</p>
                   </div>
        ) : (
          <div className="space-y-3">
            {monthRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-3">
                {row.map((month, idx) => (
                  <div key={idx} className="flex-1">
                    <div className="text-xs font-medium text-center text-muted-foreground mb-1">
                      {month.name} {month.year}
                    </div>
                    <div className="grid grid-cols-7 gap-[1px]">
                      {generateMonthCalendar(month.year, month.month).flat().map((day, dayIdx) => (
                        <div
                          key={dayIdx}
                          className="flex items-center justify-center p-[1px]"
                        >
                          <div
                            className={cn(
                              "aspect-square w-3/4 rounded-[2px]",
                              day?.status && day.status !== 'vacation' ? getStatusClass(day.status) : "bg-transparent"
                            )}
                            title={day ? `Day ${day.day}: ${day.status || 'No data'}` : ''}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs mt-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-green-500"></div>
            <span>Attended</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-red-500"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-blue-500"></div>
            <span>Excused</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-orange-500"></div>
            <span>No Check-out</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-white border border-gray-200"></div>
            <span>No Schedule</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
