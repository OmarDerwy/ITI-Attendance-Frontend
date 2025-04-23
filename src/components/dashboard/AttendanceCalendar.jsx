import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { axiosBackendInstance } from "@/api/config";
import { useUser } from "@/context/UserContext";

const AttendanceCalendar = () => {
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { studentTrack, attendanceStats } = useUser();

  // Memoize fetchAttendanceData
  const fetchAttendanceData = useMemo(
    () => async () => {
      try {
        setIsLoading(true);
        const response = await axiosBackendInstance.get(
          "attendance/student-attendance-summary/"
        );
        // Process the data into the format needed for the calendar
        const processedData = {};
        response.data.forEach((item) => {
          processedData[item.date] = item.status;
        });

        setAttendanceData(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setIsLoading(false);
      }
    },
    []
  );

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
    if (studentTrack?.track?.program_type === "intensive") {
      monthsToShow = 6;
    } else {
      monthsToShow = 9;
    }
    // Always show monthsToShow starting from join date
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(joinDate);
      date.setMonth(joinDate.getMonth() + i);
      months.push({
        name: date.toLocaleString("default", { month: "short" }),
        year: date.getFullYear(),
        month: date.getMonth(),
      });
    }

    return months;
  };

  const calendarMonths = getMonthsFromJoinDate();

  // Returns the appropriate class based on attendance status
  const getStatusClass = (status) => {
    // Attended statuses - Green
    if (
      [
        "attended",
        "check-in",
        "excused",
        "late-check-in_early-excused",
        "check-in_early-excused",
        "late_excused",
      ].includes(status)
    ) {
      return "bg-green-500";
    } else if (
      ["check-in_early-check-out", "late-check-in", "late"].includes(status)
    ) {
      return "bg-green-300";
    } else if (
      ["late-check-in_early-check-out", "late-check-in_no-check-out"].includes(
        status
      )
    ) {
      return "bg-green-200";
    }

    // Absent statuses - Red
    else if (status === "absent") {
      return "bg-red-500";
    }
    else if (["no-check-out", "late"].includes(status)) {
      return "bg-green-300";
    } else if (status === "check_in_active") {
      return "bg-blue-300";
    } else {
      return "bg-green border border-orange-200";
    }
  };

  // Function to check if a date is today
  const isToday = (year, month, day) => {
    if (!day) return false;
    const today = new Date();
    return day.day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
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
      const dateString = dateObj.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      days.push({
        day: i,
        status: attendanceData[dateString] || null,
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

  // Get attendance stats from context
  const present = attendanceStats?.total_attended || 0;
  const absent = attendanceStats?.total_absent || 0;
  const totalDays = attendanceStats?.total_days || 0;
  const attendancePercentage = attendanceStats?.attendance_percentage || 
      (totalDays > 0 ? Math.round((present / totalDays) * 100) : 0);

  return (
    <Card className="bg-slate-50 border border-slate-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold leading-none tracking-tight">
            Attendance Calendar
          </h2>
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
                      {generateMonthCalendar(month.year, month.month)
                        .flat()
                        .map((day, dayIdx) => (
                          <div
                            key={dayIdx}
                            className="flex items-center justify-center p-[1px]"
                          >
                            <div
                              className={cn(
                                "aspect-square w-3/4 rounded-[2px]",
                                day?.status && day.status !== "vacation"
                                  ? getStatusClass(day.status)
                                  : "bg-transparent",
                                isToday(month.year, month.month, day) && 
                                  "border-b-2 border-primary"
                              )}
                              title={
                                day
                                  ? `${day.day.toString().padStart(2, '0')}-${(month.month + 1).toString().padStart(2, '0')}-${month.year}: ${day.status || "No schedule"}`
                                  : ""
                              }
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

        <div className="mt-4 border-t pt-3">
          <div className="flex flex-wrap justify-between items-start">
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-[2px] bg-green-500"></div>
                <span>Attended</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-[2px] bg-green-300"></div>
                <span>Late</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-[2px] bg-green-200"></div>
                <span>Missing Checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-[2px] bg-red-500"></div>
                <span>Absent</span>
              </div>
            </div>
            
            {/* Attendance Stats */}
            <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
              <div className="bg-green-50 rounded-md px-3 py-2 text-sm">
                <span className="font-medium text-green-700">Present:</span> 
                <span className="text-green-800 ml-1">{present}</span>
              </div>
              <div className="bg-red-50 rounded-md px-3 py-2 text-sm">
                <span className="font-medium text-red-700">Absent:</span> 
                <span className="text-red-800 ml-1">{absent}</span>
              </div>
              <div className="bg-blue-50 rounded-md px-3 py-2 text-sm flex-1 max-w-fit">
                <span className="font-medium text-blue-600">Attendance:</span>
                <span className="text-blue-600 ml-1">
                  {attendancePercentage}% for {totalDays} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
