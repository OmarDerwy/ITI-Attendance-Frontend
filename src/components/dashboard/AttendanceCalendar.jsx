import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from "lucide-react";
import { cn } from '@/lib/utils';

const AttendanceCalendar = () => {
  // Generate mock attendance data for the last 6 months
  const generateAttendanceData = () => {
    const statuses = ['attended', 'absent', 'excused', 'vacation', null];
    const data = {};
    
    // Current date
    const currentDate = new Date();
    
    // Generate data for the past 6 months
    for (let m = 5; m >= 0; m--) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() - m);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        // Skip future dates
        if (date > currentDate) continue;
        
        const dateKey = `${year}-${month+1}-${d}`;
        const randomIndex = Math.floor(Math.random() * statuses.length);
        data[dateKey] = statuses[randomIndex];
      }
    }
    
    return data;
  };
  
  const attendanceData = generateAttendanceData();
  
  // Get month names for the last 6 months
  const getLastSixMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      months.push({
        name: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }
    
    return months;
  };
  
  const lastSixMonths = getLastSixMonths();
  
  // Returns the appropriate class based on attendance status
  const getStatusClass = (status) => {
    switch(status) {
      case 'attended':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'excused':
        return 'bg-amber-400';
      case 'vacation':
        return 'bg-gray-300';
      default:
        return 'bg-blue-100';
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
      const dateKey = `${year}-${month+1}-${i}`;
      days.push({
        day: i,
        status: attendanceData[dateKey]
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
  for (let i = 0; i < lastSixMonths.length; i += 3) {
    monthRows.push(lastSixMonths.slice(i, i + 3));
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold leading-none tracking-tight">Attendance Calendar</h2>
        </div>
        
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
                            day?.status ? getStatusClass(day.status) : "bg-transparent"
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
            <div className="w-2 h-2 rounded-[2px] bg-amber-400"></div>
            <span>Excused</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-gray-300"></div>
            <span>Vacation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
