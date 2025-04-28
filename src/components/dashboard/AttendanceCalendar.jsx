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
        "late-check-in_early-excused",
        "check-in_early-excused",
        "late_excused",
      ].includes(status)
    ) {
      return "bg-emerald-500 dark:bg-emerald-600/90"; // Enhanced dark mode
    } else if (
      [
        "check-in_early-check-out",
        "late-check-in",
        "check-in",
        "late",
        "check_in_active",
      ].includes(status)
    ) {
      return "bg-emerald-300 dark:bg-emerald-400/90"; // Enhanced dark mode
    } else if (
      ["late-check-in_early-check-out"].includes(status)
    ) {
      return "bg-emerald-100 dark:bg-emerald-300/90"; // Enhanced dark mode
    }
    // Absent statuses - Red
    else if (["absent"].includes(status)) {
      return "bg-red-400 dark:bg-red-600/90"; // Enhanced dark mode
    }
    else if (["excused"].includes(status)) {
      return "bg-red-200 dark:bg-red-400/90"; // Enhanced dark mode
    }
    
    // Changed orange to yellow for these statuses
    else if (["late-check-in_no-check-out"].includes(status)) {
      return "bg-yellow-300 dark:bg-yellow-500/90";
    }
    else if (["no-check-out"].includes(status)) {
      return "bg-yellow-200 dark:bg-yellow-400/90";
    }
    else {
      return "bg-yellow-200 dark:bg-yellow-500/90"; // Default also changed to yellow
    }
  };

  // Function to check if a date is today
  const isToday = (year, month, day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day.day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Function to generate calendar data for each month
  const generateMonthCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Determine the maximum day to show (up to today for current month)
    let maxDay = daysInMonth;
    if (year === today.getFullYear() && month === today.getMonth()) {
      maxDay = today.getDate(); // Only show days up to today for current month
    }

    // Initialize days array with empty days
    const days = Array(firstDay).fill(null);

    // Add the days of the month up to maxDay
    for (let i = 1; i <= maxDay; i++) {
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
  const attendancePercentage =
    attendanceStats?.attendance_percentage ||
    (totalDays > 0 ? Math.round((present / totalDays) * 100) : 0);

  // New animation helper function to calculate staggered delays
  const getAnimationDelay = (rowIndex, colIndex, dayIdx) => {
    // Base delay plus staggered time based on position
    const baseDelay = 0.1;
    const rowDelay = rowIndex * 0.05;
    const colDelay = colIndex * 0.02;
    const dayDelay = dayIdx * 0.01;
    return `${baseDelay + rowDelay + colDelay + dayDelay}s`;
  };

  return (
    <Card
      className="shadow-md overflow-hidden border-2 border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-300/70 dark:hover:border-emerald-700/40 transition-colors bg-gradient-to-b from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/10"
    >
      <style jsx global>{`
        @keyframes fadeScale {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .calendar-day {
          animation: fadeScale 0.5s ease-out forwards;
          animation-play-state: paused;
          opacity: 0;
        }
        
        .calendar-loaded .calendar-day {
          animation-play-state: running;
        }
        
        .month-title {
          animation: fadeScale 0.4s ease-out forwards;
          animation-delay: 0.05s;
          opacity: 0;
        }
        
        .calendar-loaded .month-title {
          animation-play-state: running;
        }
      `}</style>

      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
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
          <div className={`space-y-2 calendar-loaded transition-opacity duration-300`}>
            {monthRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex overflow-x-auto">
                {row.map((month, idx) => (
                  <div
                    key={idx}
                    className="flex-1 min-w-0 mr-3 last:mr-0 border border-emerald-100 dark:border-emerald-900/30 rounded-md p-1.5 bg-white dark:bg-gray-900/50 shadow-xs"
                  >
                    <div className="text-xs font-medium text-center text-emerald-700 dark:text-emerald-400 mb-1 month-title">
                      {month.name} {month.year}
                    </div>
                    <div className="grid grid-cols-7">
                      {generateMonthCalendar(month.year, month.month)
                        .flat()
                        .map((day, dayIdx) => (
                          <div
                            key={dayIdx}
                            className="flex items-center justify-center mx-[0.5px] my-[2px]"
                          >
                            <div
                              className={cn(
                                "aspect-square w-3/5 rounded-[3px] calendar-day",
                                day?.status && day.status !== "vacation"
                                  ? getStatusClass(day.status)
                                  : "bg-transparent",
                                isToday(month.year, month.month, day) &&
                                  "border-2 border-yellow-500 dark:border-yellow-400"
                              )}
                              style={{ 
                                animationDelay: getAnimationDelay(rowIndex, idx, dayIdx) 
                              }}
                              title={
                                day
                                  ? `${day.day.toString().padStart(2, "0")}-${(
                                      month.month + 1
                                    ).toString().padStart(2, "0")}-${month.year}: ${
                                      day.status || "No schedule"
                                    }`
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

        <div className="mt-4 border-t dark:border-t-gray-800 pt-3">
          <div className="flex flex-wrap justify-between items-start">
            {/* Legend - Updated to match new colors */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-none bg-emerald-500 dark:bg-emerald-600/90"></div>
                <span>Attended</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-none bg-emerald-300 dark:bg-emerald-400/90"></div>
                <span>Late</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-none bg-yellow-200 dark:bg-yellow-400/90"></div>
                <span>Missing Checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-none bg-red-400 dark:bg-red-600/90"></div>
                <span>Absent</span>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-md px-3 py-2 text-sm">
                <span className="font-medium text-green-700 dark:text-green-400">
                  Present:
                </span>
                <span className="text-green-800 dark:text-green-300 ml-1">
                  {present}
                </span>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2 text-sm">
                <span className="font-medium text-red-700 dark:text-red-400">
                  Absent:
                </span>
                <span className="text-red-800 dark:text-red-300 ml-1">
                  {absent}
                </span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md px-3 py-2 text-sm flex-1 max-w-fit">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Attendance:
                </span>
                <span className="text-blue-600 dark:text-blue-300 ml-1">
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
