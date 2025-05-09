import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, ChartPie, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const OnlineVsOfflineCard = ({ trackData }) => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [visibleTracks, setVisibleTracks] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  // Number of tracks to show at once
  const TRACKS_TO_SHOW = 5;

  // Weekday labels for calendar
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // Color constants - using CSS variables for theme support
  // Using gray for online and primary (red) for offline
  const onlineColor = "hsl(var(--muted-foreground))"; // Gray for online
  const offlineColor = "hsl(var(--primary))"; // Red for offline

  // Find the track with the highest online percentage as default selected
  useEffect(() => {
    if (trackData.length && !selectedTrack) {
      const bestTrack = trackData.reduce((prev, current) =>
        prev.onlinePercentage > current.onlinePercentage ? prev : current
      );
      setSelectedTrack(bestTrack);
    }
  }, [trackData, selectedTrack]);

  // Update visible tracks when data changes or navigation happens
  useEffect(() => {
    if (trackData.length) {
      const end = Math.min(startIndex + TRACKS_TO_SHOW, trackData.length);
      setVisibleTracks(trackData.slice(startIndex, end));
    } else {
      // Clear visible tracks when no data
      setVisibleTracks([]);
    }
  }, [trackData, startIndex]);

  // Ensure selected track is visible
  useEffect(() => {
    if (selectedTrack && trackData.length) {
      const selectedIndex = trackData.findIndex(
        (track) => track.id === selectedTrack.id
      );

      // If selected track is outside visible range, adjust startIndex
      if (
        selectedIndex < startIndex ||
        selectedIndex >= startIndex + TRACKS_TO_SHOW
      ) {
        // Calculate new start index to center the selected track if possible
        let newStartIndex = Math.max(
          0,
          selectedIndex - Math.floor(TRACKS_TO_SHOW / 2)
        );

        // Ensure we don't go beyond the end
        if (newStartIndex + TRACKS_TO_SHOW > trackData.length) {
          newStartIndex = Math.max(0, trackData.length - TRACKS_TO_SHOW);
        }

        setStartIndex(newStartIndex);
      }
    }
  }, [selectedTrack, trackData, startIndex]);

  // Handle filter by track selection
  const handleTrackSelect = (trackId) => {
    const track = trackData.find((track) => track.id.toString() === trackId);
    if (track) {
      setSelectedTrack(track);
    }
  };

  // Handle navigation between tracks
  const handleNavigate = (direction) => {
    if (!selectedTrack) return;

    const currentIndex = trackData.findIndex(
      (track) => track.id === selectedTrack.id
    );
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === "left") {
      newIndex = (currentIndex - 1 + trackData.length) % trackData.length;
    } else {
      newIndex = (currentIndex + 1) % trackData.length;
    }

    setSelectedTrack(trackData[newIndex]);
  };

  // Prepare data for pie chart
  const getPieData = (track) => [
    { name: "Online Days", value: track.onlineDays, color: onlineColor },
    { name: "Offline Days", value: track.offlineDays, color: offlineColor },
  ];

  // Check if pie chart has data
  const hasPieData = (track) => {
    return track.onlineDays > 0 || track.offlineDays > 0;
  };

  // Generate yearly calendar data from track's daily data
  const generateYearlyCalendar = () => {
    if (!selectedTrack || !selectedTrack.dailyData) return [];

    // If we have monthly data from the API, use it
    if (selectedTrack.monthlyData && selectedTrack.monthlyData.length > 0) {
      return selectedTrack.monthlyData.map((monthData) => {
        const monthDate = new Date(monthData.year, monthData.month, 1);

        // Create days array from daily data that falls within this month
        const days = selectedTrack.dailyData
          .filter((day) => {
            const date = new Date(day.date);
            return (
              date.getMonth() === monthData.month &&
              date.getFullYear() === monthData.year
            );
          })
          .map((day) => ({
            date: new Date(day.date),
            isOnline: day.isOnline,
          }));

        return {
          month: monthDate,
          name: format(monthDate, "MMM"),
          days,
          stats: {
            totalDays: monthData.totalDays,
            onlineDays: monthData.onlineDays,
            offlineDays: monthData.offlineDays,
            onlinePercentage: monthData.onlinePercentage,
            offlinePercentage: monthData.offlinePercentage,
          },
        };
      });
    }

    // Group days by month
    const monthsMap = {};
    selectedTrack.dailyData.forEach((day) => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1),
          name: format(date, "MMM"),
          days: [],
        };
      }

      monthsMap[monthKey].days.push({
        date,
        isOnline: day.isOnline,
      });
    });

    return Object.values(monthsMap);
  };

  // Calculate monthly statistics
  const calculateMonthlyStats = (days) => {
    const totalDays = days.length;
    const onlineDays = days.filter((day) => day.isOnline).length;
    const offlineDays = totalDays - onlineDays;

    return {
      totalDays,
      onlineDays,
      offlineDays,
      onlinePercentage: Math.round((onlineDays / totalDays) * 100) || 0,
      offlinePercentage: Math.round((offlineDays / totalDays) * 100) || 0,
    };
  };

  // Animation variants for cards - subtle difference between selected and normal
  const cardVariants = {
    normal: { opacity: 0.7 },
    selected: { opacity: 1 },
  };

  // Get yearly calendar data
  const yearlyCalendar = selectedTrack ? generateYearlyCalendar() : [];

  // Function to get status class based on attendance type (online/offline)
  const getStatusClass = (isOnline) => {
    return isOnline
      ? "bg-muted-foreground dark:bg-muted-foreground/90"
      : "bg-primary dark:bg-primary/90";
  };

  // Function to check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate calendar data for each month (similar to AttendanceCalendar)
  const generateMonthCalendar = (month) => {
    const firstDay = new Date(month.month).getDay();
    const daysInMonth = new Date(
      month.month.getFullYear(),
      month.month.getMonth() + 1,
      0
    ).getDate();

    // Initialize days array with empty days for proper alignment
    const days = Array(firstDay).fill(null);

    // Create a map of dates to their online/offline status
    const dateStatusMap = {};
    month.days.forEach((day) => {
      const dateKey = format(new Date(day.date), "yyyy-MM-dd");
      dateStatusMap[dateKey] = day.isOnline;
    });

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(
        month.month.getFullYear(),
        month.month.getMonth(),
        i
      );
      const dateString = format(dateObj, "yyyy-MM-dd");

      // Check if we have data for this day
      if (dateString in dateStatusMap) {
        days.push({
          day: i,
          isOnline: dateStatusMap[dateString],
          date: dateObj,
        });
      } else {
        // No data for this day
        days.push({
          day: i,
          isOnline: null,
          date: dateObj,
        });
      }
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

  // Animation helper function to calculate staggered delays (from AttendanceCalendar)
  const getAnimationDelay = (rowIndex, colIndex, dayIdx) => {
    const baseDelay = 0.1;
    const rowDelay = rowIndex * 0.05;
    const colDelay = colIndex * 0.02;
    const dayDelay = dayIdx * 0.01;
    return `${baseDelay + rowDelay + colDelay + dayDelay}s`;
  };

  // Function to handle pagination
  const handlePagination = (direction) => {
    if (trackData.length <= TRACKS_TO_SHOW) return;

    if (direction === "next") {
      const newStartIndex = Math.min(
        startIndex + TRACKS_TO_SHOW,
        trackData.length - TRACKS_TO_SHOW
      );
      setStartIndex(newStartIndex);
    } else {
      const newStartIndex = Math.max(0, startIndex - TRACKS_TO_SHOW);
      setStartIndex(newStartIndex);
    }
  };

  // Render empty pie chart state
  const renderEmptyPieChart = () => (
    <div className="h-36 w-36 mx-auto flex flex-col items-center justify-center text-muted-foreground">
      <AlertCircle className="h-10 w-10 mb-2 opacity-70" />
      <p className="text-xs text-center">No Schedules data available</p>
    </div>
  );

  return (
    <Card className="overflow-hidden border-2 border-primary/20 dark:border-primary/30 transition-colors bg-gradient-to-b from-white to-primary-50/50 dark:from-gray-900 dark:to-primary/5">
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

      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <ChartPie className="h-5 w-5 text-primary" />
              Track Schedule Statistics
            </CardTitle>
            <CardDescription>
              Online vs offline attendance days per track
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNavigate("left")}
              className="p-1 rounded-full hover:bg-muted disabled:opacity-50"
              disabled={!selectedTrack}
              title="Previous track"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleNavigate("right")}
              className="p-1 rounded-full hover:bg-muted disabled:opacity-50"
              disabled={!selectedTrack}
              title="Next track"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Track selection cards */}
        <div className="mb-4 relative">
          {/* Track cards container */}
          <div
            ref={containerRef}
            className="flex space-x-4 overflow-hidden pb-4"
          >
            {visibleTracks.length > 0 ? (
              visibleTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  variants={cardVariants}
                  animate={
                    selectedTrack?.id === track.id ? "selected" : "normal"
                  }
                  transition={{ duration: 0.3 }}
                  onClick={() => handleTrackSelect(track.id.toString())}
                  className={`flex-shrink-0 cursor-pointer rounded-lg p-6 border ${
                    selectedTrack?.id === track.id
                      ? "border-primary shadow-md"
                      : "border-border/30"
                  }`}
                  style={{
                    width: "280px",
                    backgroundColor:
                      selectedTrack?.id === track.id
                        ? "hsl(var(--card))"
                        : "hsl(var(--background))",
                  }}
                >
                  <div className="text-center">
                    <h4 className="font-medium mb-1 truncate text-base">
                      {track.name}
                    </h4>
                    {/* Small text under track name */}
                    <p className="text-[0.65rem] text-muted-foreground mb-3">
                      {track.programType} ({track.intake})
                    </p>
                    
                    {/* Pie chart or empty state */}
                    {hasPieData(track) ? (
                      <div className="h-36 w-36 mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPieData(track)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={55}
                              paddingAngle={2}
                              dataKey="value"
                              activeShape={null} // This removes any special active shape
                              onMouseEnter={null} // Remove any hover handlers
                              onMouseLeave={null}
                              isAnimationActive={true}
                              activeIndex={[]} // This will prevent any active state
                            >
                              {getPieData(track).map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      renderEmptyPieChart()
                    )}
                    
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center">
                          <span className="h-3 w-3 bg-[hsl(var(--muted-foreground))] mr-2"></span>
                          <span>Online</span>
                        </span>
                        <span>
                          {track.onlineDays} days ({track.onlinePercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <span className="h-3 w-3 bg-[hsl(var(--primary))] mr-2"></span>
                          <span>Offline</span>
                        </span>
                        <span>
                          {track.offlineDays} days ({track.offlinePercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-8 text-muted-foreground">
                No track data available
              </div>
            )}
          </div>

          {/* Track pagination indicator */}
          {trackData.length > TRACKS_TO_SHOW && (
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => handlePagination("prev")}
                className="text-xs px-2 py-1 rounded hover:bg-muted disabled:opacity-50"
                disabled={startIndex === 0}
              >
                Previous
              </button>
              <div className="text-xs text-center text-muted-foreground">
                Showing tracks {startIndex + 1}-
                {Math.min(startIndex + TRACKS_TO_SHOW, trackData.length)} of{" "}
                {trackData.length}
              </div>
              <button
                onClick={() => handlePagination("next")}
                className="text-xs px-2 py-1 rounded hover:bg-muted disabled:opacity-50"
                disabled={startIndex + TRACKS_TO_SHOW >= trackData.length}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Selected track details */}
        {selectedTrack && (
          <div className="mt-8">
            <h3 className="text-base font-semibold mb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Calendar className="h-5 w-5 text-primary" />
                Monthly Attendance for
                <span className="italic text-gray-700 dark:text-red-400">
                  {selectedTrack.name} - {selectedTrack.programType} (
                  {selectedTrack.intake})
                </span>
              </CardTitle>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {yearlyCalendar.length > 0 ? (
                yearlyCalendar.map((month, monthIndex) => {
                  // Use pre-calculated stats if available, otherwise calculate from days
                  const monthStats =
                    month.stats || calculateMonthlyStats(month.days);
                  const monthCalendar = generateMonthCalendar(month);

                  return (
                    <div
                      key={monthIndex}
                      className="border border-primary/10 dark:border-primary/30 rounded-md p-1 bg-white dark:bg-gray-900/50 shadow-xs"
                    >
                      <div className="text-xs font-medium text-center text-muted-foreground dark:text-muted-foreground/80 mb-1 month-title">
                        {month.name} {new Date(month.month).getFullYear()}
                      </div>

                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 mb-0.5">
                        {weekDays.map((day, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-center"
                          >
                            <span className="text-[0.7rem] text-muted-foreground">
                              {day}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Calendar grid using AttendanceCalendar style */}
                      <div
                        className={`calendar-loaded transition-opacity duration-300`}
                      >
                        {monthCalendar.map((week, weekIndex) => (
                          <div key={weekIndex} className="grid grid-cols-7">
                            {week.map((day, dayIndex) => (
                              <div
                                key={dayIndex}
                                className="flex items-center justify-center mx-[0.5px] my-[1px]"
                              >
                                <div
                                  className={cn(
                                    "aspect-square w-1/2 rounded-[2px] calendar-day",
                                    day && day.isOnline !== null
                                      ? getStatusClass(day.isOnline)
                                      : "bg-transparent",
                                    day &&
                                      isToday(day.date) &&
                                      "border border-yellow-500 dark:border-yellow-400"
                                  )}
                                  style={{
                                    animationDelay: getAnimationDelay(
                                      monthIndex,
                                      weekIndex,
                                      dayIndex
                                    ),
                                  }}
                                  title={
                                    day
                                      ? `${day.day
                                          .toString()
                                          .padStart(2, "0")}-${(
                                          month.month.getMonth() + 1
                                        )
                                          .toString()
                                          .padStart(
                                            2,
                                            "0"
                                          )}-${month.month.getFullYear()}: ${
                                          day.isOnline !== null
                                            ? day.isOnline
                                              ? "Online"
                                              : "Offline"
                                            : "No schedule"
                                        }`
                                      : ""
                                  }
                                ></div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="text-[0.65rem] space-y-0.5 mt-1 px-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Online:</span>
                          <span className="font-medium">
                            {monthStats.onlineDays} days (
                            {monthStats.onlinePercentage}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Offline:
                          </span>
                          <span className="font-medium">
                            {monthStats.offlineDays} days (
                            {monthStats.offlinePercentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No calendar data available for this track
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineVsOfflineCard;