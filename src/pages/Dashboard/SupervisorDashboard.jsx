import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Clock, Check, HandHeart, AlertTriangle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodaysAttendancePercentage, getWeeklyAttendancePercentage, getAttendanceTrends, getScheduledClasses, get_weekly_attendance_by_track, getRecentAbsentees } from '@/api/attendance';
import { usePermissions } from '@/context/PermissionsContext';
import RecentAbsences from '@/components/dashboard/RecentAbsences';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosBackendInstance } from '@/api/config';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);

const SupervisorDashboard = () => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];
  const [filteredData, setFilteredData] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedDailyTrendTrack, setSelectedDailyTrendTrack] = useState("all");
  const [selectedWeeklyTrendTrack, setSelectedWeeklyTrendTrack] = useState("all");
  const [selectedRecentAbsencesTrack, setSelectedRecentAbsencesTrack] = useState("all");
  const { totalPendingPermissions, isLoading: permissionsLoading, error } = usePermissions();
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [weeklyBreakdownTrack, setWeeklyBreakdownTrack] = useState("All tracks");
  const [recentAbsences, setRecentAbsences] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const tracksResponse = await axiosBackendInstance.get('attendance/tracks/');
        const tracks = tracksResponse.data;
        
        if (tracks && tracks.length > 0) {
          const defaultTrackId = tracks[0].id.toString();
          setSelectedTrack(defaultTrackId);
          
          const classesResponse = await getScheduledClasses(parseInt(defaultTrackId));
          
          const todayClasses = classesResponse.filter(cls => 
            cls.start && dayjs(cls.start).isToday()
          );
          
          setScheduledClasses(todayClasses);
          
          setTimeout(() => {
            setScheduledClasses([...todayClasses]);
          }, 500);
        }
      } catch (error) {
        console.error('Error during initial data fetch:', error);
      }
    };
    
    fetchInitialData();
  }, []);

  const { data: tracksData } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await axiosBackendInstance.get('attendance/tracks/');
      return response.data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
      }
    }
  });

  const { data: todayAttendance, isLoading, isError, errorr } = useQuery({
    queryKey: ['todayAttendancePercentage'],
    queryFn: getTodaysAttendancePercentage,
    staleTime: 5 * 60 * 1000, //the amount of time after fetching during which the data is considered fresh.
    cacheTime: 10 * 60 * 1000, //How long inactive (unused) data stays in the cache before it’s garbage collected.If the component unmounts, the data stays in memory for this time.
    refetchInterval: 30000, // React Query will automatically refetch the data and it works regardles the data is stale or not
    refetchIntervalInBackground: false,
    onError: (errorr) => {
      console.error("Error fetching today's attendance:", errorr);
    },
  });

  const { data: weeklyAttendance, isLoading: weeklyLoading, isError: weeklyError, error: weeklyErrorData } = useQuery({
    queryKey: ['weeklyAttendancePercentage'],
    queryFn: getWeeklyAttendancePercentage,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    onSuccess: (data) => {
    },
    onError: (error) => {
      console.error("Error fetching weekly attendance:", error);
    },
  });

  const { data: dailyTrendsData, isLoading: dailyTrendsLoading, isError: dailyTrendsError } = useQuery({
    queryKey: ['dailyAttendanceTrends', selectedDailyTrendTrack],
    queryFn: () => getAttendanceTrends(selectedDailyTrendTrack === "all" ? null : parseInt(selectedDailyTrendTrack)),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onSuccess: (data) => {
    },
    onError: (error) => {
      console.error("Error fetching daily trends:", error);
    },
  });

  const { data: weeklyTrendsQueryData, isLoading: weeklyTrendsLoading } = useQuery({
    queryKey: ['weeklyAttendanceTrends', selectedWeeklyTrendTrack],
    queryFn: () => getAttendanceTrends(selectedWeeklyTrendTrack === "all" ? null : parseInt(selectedWeeklyTrendTrack)),
    staleTime: 5 * 60 * 1000, 
    onError: (error) => {
      console.error("Error fetching weekly trends:", error);
    },
    onSuccess: (data) => {
    }
  });

  useEffect(() => {
    if (weeklyTrendsQueryData && weeklyTrendsQueryData.weekly_trends) { 
      const today = dayjs(); 

      const processedData = weeklyTrendsQueryData.weekly_trends.filter(item => {
        const itemDate = dayjs(item.week); 
        return itemDate.isValid() && itemDate.isSameOrBefore(today, 'day');
      });

      setFilteredData(processedData);
    } else {
      setFilteredData([]); 
    }
  }, [weeklyTrendsQueryData]); 

  const { data: warningsCount, isLoading: warningsLoading, isError: warningsError, error: warningsErrorData } = useQuery({
    queryKey: ["studentsWithWarningsCount"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get(
        "/attendance/students/with-warnings/"
      );
      return (response.data).length;
    },
    refetchOnWindowFocus: false,
  });

  const { data: scheduledClassesData, isLoading: scheduledClassesLoading, isError: scheduledClassesError, error: scheduledClassesErrorData } = useQuery({
    queryKey: ['scheduledClasses', selectedTrack],
    queryFn: () => getScheduledClasses(parseInt(selectedTrack)),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    enabled: Boolean(selectedTrack) && selectedTrack !== "all" && selectedTrack !== "" && !isNaN(parseInt(selectedTrack)),
    onSuccess: (data) => {
      if (data) {
        const todayClasses = data.filter(cls =>
          cls.start && dayjs(cls.start).isToday()
        );
        setScheduledClasses(todayClasses);
      } else {
        setScheduledClasses([]);
      }
    },
    onError: (error) => {
      console.error("Error fetching scheduled classes:", error);
      setScheduledClasses([]);
    },
  });

  const { data: weeklyAttendanceBreakdown, isLoading: weeklyAttendanceBreakdownLoading, isError: weeklyAttendanceBreakdownError } = useQuery({
    queryKey: ['weeklyAttendanceBreakdown'],
    queryFn: get_weekly_attendance_by_track,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    onSuccess: (data) => {
    },
    onError: (error) => {
      console.error("Error fetching weekly attendance breakdown:", error);
    },
  });

  const { data: recentAbsencesData, isLoading: recentAbsencesLoading, isError: recentAbsencesError } = useQuery({
    queryKey: ['recentAbsences', selectedRecentAbsencesTrack],
    queryFn: () => getRecentAbsentees(selectedRecentAbsencesTrack === "all" ? undefined : parseInt(selectedRecentAbsencesTrack)),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    onSuccess: (data) => {
    },
    onError: (error) => {
      console.error("Error fetching recent absences:", error);
    },
  });

  useEffect(() => {
    if (weeklyAttendanceBreakdown) {
      const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const transformedData = days.map(day => {
        const dayData = weeklyAttendanceBreakdown[day] || {};
        const trackData = dayData[weeklyBreakdownTrack] || dayData['All tracks'] || {};
        const isFreeDay = trackData.status === 'Free Day';

        return {
          name: day,
          attendance: isFreeDay ? null : (trackData.present_percent || 0),
          isFreeDay,
          absent: isFreeDay ? null : (trackData.absent_percent || 0)
        };
      });      
      
      setWeeklyBreakdown(transformedData);
    }
  }, [weeklyAttendanceBreakdown, weeklyBreakdownTrack]);

  useEffect(() => {
    if (recentAbsencesData) {
        
      const formattedAbsences = recentAbsencesData.map(absence => ({
        id: Math.random().toString(36).substring(2, 9), 
        student: absence.student,
        date: new Date(absence.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        reason: absence.reason || 'N/A',
        status: absence.status
      }));

      setRecentAbsences(formattedAbsences);
    }
  }, [recentAbsencesData]);

  useEffect(() => {
    if (dailyTrendsData) {
      const currentDate = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);

      const totalStudents = todayAttendance?.total_students || 0;

      const dailyFiltered = dailyTrendsData.daily_trends
        .filter((dayData) => {
          const dayDate = new Date(dayData.date);
          return dayDate >= sevenDaysAgo && dayDate <= currentDate;
        })
        .map(dayData => ({
          date: dayData.date,
          attendance_percentage: totalStudents > 0 ? Math.round((dayData.attended / totalStudents) * 100) : 0
        }));

      setDailyTrends(dailyFiltered);
    }
  }, [dailyTrendsData, todayAttendance]);

  useEffect(() => {
    if (weeklyTrendsQueryData) {
      const currentDate = new Date();
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(currentDate.getDate() - 28);
      const totalStudents = todayAttendance?.total_students || 0;

      const weeklyFiltered = weeklyTrendsQueryData.weekly_trends
        .filter((weekData) => {
          const weekDate = new Date(weekData.week);
          return weekDate >= fourWeeksAgo && weekDate <= currentDate;
        })
        .map(weekData => ({
          week: weekData.week,
          attendance_percentage: totalStudents > 0 ? Math.round((weekData.attended / (totalStudents * 5)) * 100) : 0
        }));

      setFilteredData(weeklyFiltered);
    }
  }, [weeklyTrendsQueryData, todayAttendance]);

  useEffect(() => {
    if (selectedTrack === "all" || selectedTrack === "") {
      setScheduledClasses([]);
    }
  }, [selectedTrack]);

  const handleSelect = (date) => {
    if (date) {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      navigate(`/attendance-status?from_date=${formattedDate}`);
    }
  };

  const todayIndex = dayjs().day(); // 0 (Sunday) - 6 (Saturday)
  // Convert JavaScript day index (0=Sunday) to our day index (0=Saturday)
  const adjustedTodayIndex = todayIndex === 0 ? 1 : todayIndex - 1;
  
  // Don't filter out data based on day index for now - show all data
  const displayWeeklyBreakdown = weeklyBreakdown;
  const [calendarMonths, setCalendarMonths] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      setCalendarMonths(window.innerWidth < 1700 ? 1 : 2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 text-center border border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                <Check className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {isLoading || todayAttendance == null
                ? 'Loading...'
                : `${todayAttendance.attendance_percentage ?? 0}%`}
            </div>
            <CardDescription>Today's Attendance</CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {weeklyLoading || !weeklyAttendance ? 'Loading...' : `${weeklyAttendance?.attendance_percentage ?? 0}%`}
            </div>
            <CardDescription>Weekly Average</CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center border border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-white">
                <HandHeart className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700">{permissionsLoading || totalPendingPermissions === null ? 'Loading...' : `${totalPendingPermissions}`}</div>
            <CardDescription>permission Requests</CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center border border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 rounded-full bg-red-700 flex items-center justify-center text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-700">
              {isLoading ? 'Loading...' : warningsCount || 0}
            </div>
            <CardDescription>Students with Warnings</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card >
          <CardHeader>
            <CardTitle className="text-lg">Attendance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 ">
            <div className="grid place-items-center w-full">

              <Calendar
                mode="single"
                onSelect={handleSelect}
                className="calendar-component"
                numberOfMonths={calendarMonths}
              />
              {/* <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { status: 'attendance >= 75%', color: 'bg-green-200', label: 'attendance >= 75%' },
                  { status: 'attendance <= 25%', color: 'bg-red-200', label: 'attendance <= 25%' },
                  { status: '25% < attendance < 75%', color: 'bg-yellow-200', label: ' 25% < attendance < 75%' },
                  // { status: 'excused', color: 'bg-blue-200', label: 'Excused' }
                ].map(({ status, color, label }) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${color}`} />
                    <span className="text-sm capitalize">{label}</span>
                  </div>
                ))}
              </div> */}
            </div>
            </div>

          </CardContent>
          
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg">Attendance Weekly Trends</CardTitle>
              <Select
                value={selectedWeeklyTrendTrack}
                onValueChange={setSelectedWeeklyTrendTrack}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {tracksData?.map((track) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      {track.name} - {track.intake} - {track.program_type_display} - {track.start_date} - {track.default_branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip formatter={(value, name, props) => {
                    if (props?.payload?.isFreeDay) {
                      return ['Free Day', 'Status'];
                    }
                    if (name === 'Present') {
                      return [`${value}%`, 'Present'];
                    }
                    return [`${value}%`, 'Absent'];
                  }} />
                  <Line
                    type="monotone"
                    dataKey="attendance_percentage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg mb-4">Today's Classes</CardTitle>
              <Select
                value={selectedTrack}
                onValueChange={(value) => {
                  setSelectedTrack(value);
                  
                  // Immediately fetch classes when track is selected
                  if (value && value !== "all" && value !== "") {
                    const trackId = parseInt(value);
                    getScheduledClasses(trackId)
                      .then(data => {
                        const todayClasses = data.filter(cls => 
                          cls.start && dayjs(cls.start).isToday()
                        );
                        setScheduledClasses(todayClasses);
                      })
                      .catch(err => {
                        console.error("Error fetching classes on selection:", err);
                        setScheduledClasses([]);
                      });
                  }
                }}
                defaultValue={tracksData && tracksData.length > 0 ? tracksData[0].id.toString() : ""}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder={tracksData && tracksData.length > 0 ? tracksData[0].name : "Select Track"} />
                </SelectTrigger>
                <SelectContent>
                  {tracksData?.map((track) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                        {track.name} - {track.intake} - {track.program_type_display} - {track.start_date} - {track.default_branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link to="/schedule" className="text-sm text-primary flex items-center">
              View Full Schedule <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {scheduledClassesLoading ? (
              <p className="text-sm text-muted-foreground">Loading classes...</p>
            ) : scheduledClassesError ? (
              <p className="text-sm text-red-500">Error loading classes.</p>
            ) : selectedTrack === "all" || selectedTrack === "" ? (
              <p className="text-sm text-muted-foreground">Please select a track to view classes.</p>
            ) : scheduledClasses.length > 0 ? (
              scheduledClasses.map((cls) => {
                const now = dayjs();
                const startTime = dayjs(cls.start);
                const endTime = dayjs(cls.end);
                let status = "upcoming";
                if (now.isAfter(endTime)) {
                  status = "completed";
                } else if (now.isAfter(startTime) && now.isBefore(endTime)) {
                  status = "active";
                }

                return (
                  <div key={cls.id} className="flex justify-between items-center p-3 rounded-lg border shadow-sm bg-gradient-to-r from-card to-transparent dark:from-card dark:to-card/80">
                    <div className="flex items-center gap-3">
                      <div className={`${
                        status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      } p-3 rounded-full`}>
                        {status === 'active' ? <Clock className="h-5 w-5" /> : status === 'upcoming' ? <Clock className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cls.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{startTime.format('HH:mm')} - {endTime.format('HH:mm')}</span>
                          {cls.branch?.name && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                              <span>{cls.branch.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ClassBadge status={status} />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No classes scheduled for today for this track.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg mb-4">Weekly Attendance Report</CardTitle>
            <div className="flex justify-between items-center mb-4">
              <Select
                value={weeklyBreakdownTrack}
                onValueChange={setWeeklyBreakdownTrack}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All tracks">All Tracks</SelectItem>
                  {tracksData?.map((track) => (
                    <SelectItem key={track.id} value={track.name}>
                      {track.name} - {track.intake} - {track.program_type_display} - {track.start_date} - {track.default_branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {weeklyAttendanceBreakdownLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Loading weekly attendance data...</p>
                </div>
              ) : weeklyAttendanceBreakdownError ? (
                <div className="flex h-full items-center justify-center text-red-500">
                  <p>Error loading weekly attendance data</p>
                </div>
              ) : displayWeeklyBreakdown && displayWeeklyBreakdown.length > 0 ? (
                <BarChart data={displayWeeklyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (props?.payload?.isFreeDay) {
                        return ['Free Day', 'Status'];
                      }
                      if (name === 'Present') {
                        return [`${value}%`, 'Present'];
                      }
                      return [`${value}%`, 'Absent'];
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="attendance"
                    name="Present"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    label={({ x, y, width, height, value, payload }) => {
                      if (!payload) return null;
                      if (payload.isFreeDay) {
                        return (
                          <text
                            x={x + width / 2}
                            y={y + height / 2}
                            fill="#6b7280"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            Free Day
                          </text>
                        );
                      }
                      if (value) {
                        return (
                          <text
                            x={x + width / 2}
                            y={y - 5}
                            fill="#374151"
                            textAnchor="middle"
                          >
                            {`${value}%`}
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p>No attendance data available.</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {recentAbsencesLoading ? (
        <div className="text-center py-4">Loading recent absences...</div>
      ) : recentAbsencesError ? (
        <div className="text-center py-4 text-red-500">Error loading recent absences</div>
      ) : (
        <RecentAbsences
          absences={recentAbsences}
          selectedTrack={selectedRecentAbsencesTrack}
          onTrackChange={setSelectedRecentAbsencesTrack}
          tracks={tracksData}
        />
      )}
    </div>
  );
};

const ClassBadge = ({ status }) => {
  if (status === "active") {
    return (
      <div className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mr-1.5"></span>
        In Progress
      </div>
    );
  }

  if (status === "upcoming") {
    return (
      <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
        Upcoming
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      <Check className="h-3 w-3 mr-1" />
      Completed
    </div>
  );
};

export default SupervisorDashboard;