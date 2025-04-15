import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Calendar, Clock, Check, Users, AlertTriangle, BellRing } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getTodaysAttendancePercentage, getWeeklyAttendancePercentage, getAttendanceTrends, getScheduledClasses, get_weekly_attendance_by_track, getRecentAbsentees } from '@/api/attendance';
import { usePermissions } from '@/context/PermissionsContext';
import RecentAbsences from '@/components/dashboard/RecentAbsences';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosBackendInstance } from '@/api/config';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';

dayjs.extend(isToday);

const SupervisorDashboard = () => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];
  const [filteredData, setFilteredData] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("1");
  const [selectedDailyTrendTrack, setSelectedDailyTrendTrack] = useState("all");
  const [selectedWeeklyTrendTrack, setSelectedWeeklyTrendTrack] = useState("all");
  const [selectedRecentAbsencesTrack, setSelectedRecentAbsencesTrack] = useState("all");
  const { totalPendingPermissions, isLoading: permissionsLoading, error } = usePermissions();
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [weeklyBreakdownTrack, setWeeklyBreakdownTrack] = useState("All tracks");
  const [recentAbsences, setRecentAbsences] = useState([]);

  const { data: tracksData } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await axiosBackendInstance.get('attendance/tracks/');
      return response.data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setSelectedTrack(data[0].id.toString());
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
      console.log('Weekly Attendance Data:', data);
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
      console.log('Daily Trends Data Success:', data);
      console.log('Daily Trends:', data.daily_trends);
    },
    onError: (error) => {
      console.error("Error fetching daily trends:", error);
    },
  });

  const { data: weeklyTrendsData, isLoading: weeklyTrendsLoading, isError: weeklyTrendsError } = useQuery({
    queryKey: ['weeklyAttendanceTrends', selectedWeeklyTrendTrack],
    queryFn: () => getAttendanceTrends(selectedWeeklyTrendTrack === "all" ? null : parseInt(selectedWeeklyTrendTrack)),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    onSuccess: (data) => {
      console.log('Weekly Trends Data Success:', data);
      console.log('Weekly Trends:', data.weekly_trends);
    },
    onError: (error) => {
      console.error("Error fetching weekly trends:", error);
    },
  });

  const { data: scheduledClassesData, isLoading: scheduledClassesLoading, isError: scheduledClassesError, error: scheduledClassesErrorData } = useQuery({
    queryKey: ['scheduledClasses', selectedTrack],
    queryFn: () => getScheduledClasses(parseInt(selectedTrack)),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    enabled: Boolean(selectedTrack) && !isNaN(parseInt(selectedTrack)),
    onSuccess: (data) => {
      console.log('Fetched Scheduled Classes Data:', data);
    },
    onError: (error) => {
      console.error("Error fetching scheduled classes:", error);
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
      console.log('Weekly Attendance Breakdown Data:', data);
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
      console.log('Recent Absences Data:', data);
    },
    onError: (error) => {
      console.error("Error fetching recent absences:", error);
    },
  });


  useEffect(() => {
    if (weeklyAttendanceBreakdown) {
      // console.log('Weekly Attendance Breakdown Data:', weeklyAttendanceBreakdown);
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

      // console.log('Transformed Data:', transformedData);
      setWeeklyBreakdown(transformedData);
    }
  }, [weeklyAttendanceBreakdown, weeklyBreakdownTrack]);

  useEffect(() => {
    if (recentAbsencesData) {
      // console.log('Recent Absences Data:', recentAbsencesData);
            const formattedAbsences = recentAbsencesData.map(absence => ({
        id: Math.random().toString(36).substring(2, 9), 
        student: absence.student_name,
        date: new Date(absence.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        reason: absence.reason || 'N/A',
        status: absence.status
      }));
      
      // console.log('Formatted Absences:', formattedAbsences);
      setRecentAbsences(formattedAbsences);
    }
  }, [recentAbsencesData]);
  

  useEffect(() => {
    if (dailyTrendsData) {
      // console.log('Raw Daily Trends Data in useEffect:', dailyTrendsData);

      const currentDate = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);

      // console.log('Date Range:', {
      //   currentDate,
      //   sevenDaysAgo
      // });

      const totalStudents = todayAttendance?.total_students || 0;

      // Transform daily trends into percentages
      const dailyFiltered = dailyTrendsData.daily_trends
        .filter((dayData) => {
          const dayDate = new Date(dayData.date);
          return dayDate >= sevenDaysAgo && dayDate <= currentDate;
        })
        .map(dayData => ({
          date: dayData.date,
          attendance_percentage: totalStudents > 0 ? Math.round((dayData.attended / totalStudents) * 100) : 0
        }));

      // console.log('Transformed Daily Data:', dailyFiltered);
      setDailyTrends(dailyFiltered);
    }
  }, [dailyTrendsData, todayAttendance]);

  useEffect(() => {
    if (weeklyTrendsData) {
      const currentDate = new Date();
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(currentDate.getDate() - 28);
      const totalStudents = todayAttendance?.total_students || 0;

      // Transform weekly trends into percentages
      const weeklyFiltered = weeklyTrendsData.weekly_trends
        .filter((weekData) => {
          const weekDate = new Date(weekData.week);
          return weekDate >= fourWeeksAgo && weekDate <= currentDate;
        })
        .map(weekData => ({
          week: weekData.week,
          attendance_percentage: totalStudents > 0 ? Math.round((weekData.attended / (totalStudents * 5)) * 100) : 0
        }));

      // console.log('Transformed Weekly Data:', weeklyFiltered);
      setFilteredData(weeklyFiltered);
    }
  }, [weeklyTrendsData, todayAttendance]);

  useEffect(() => {
    if (selectedTrack === "all") {
      setScheduledClasses([]);
      return;
    }
    if (scheduledClassesData) {
      // console.log('Raw Scheduled Classes Data:', scheduledClassesData);
      const todayClasses = scheduledClassesData.filter(cls =>
        cls.start && dayjs(cls.start).isToday()
      );
      // console.log('Filtered Today\'s Classes:', todayClasses);
      setScheduledClasses(todayClasses);
    } else {
      setScheduledClasses([]);
    }
  }, [scheduledClassesData, selectedTrack]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Attendance */}
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

        {/* Weekly Attendance */}
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

        {/* permissions Requests */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center border border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700">{permissionsLoading || totalPendingPermissions === null ? 'Loading...' : `${totalPendingPermissions}`}</div>
            <CardDescription>permission Requests</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg">Attendance Daily Trends</CardTitle>
              <Select
                value={selectedDailyTrendTrack}
                onValueChange={setSelectedDailyTrendTrack}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {tracksData?.map((track) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg">Attendance Weekly Trends</CardTitle>
              <Select
                value={selectedWeeklyTrendTrack}
                onValueChange={setSelectedWeeklyTrendTrack}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {tracksData?.map((track) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
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
              <CardTitle className="text-lg">Today's Classes</CardTitle>
              <Select
                value={selectedTrack}
                onValueChange={setSelectedTrack}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  {tracksData?.map((track) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      {track.name}
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
            ) : scheduledClasses.length > 0 ? (
              scheduledClasses.map((cls) => {
                // Determine class status (completed, active, upcoming)
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
                  <div key={cls.id} className="flex justify-between items-center p-3 rounded-lg border shadow-sm bg-gradient-to-r from-gray-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className={`${status === 'active' ? 'bg-emerald-100 text-emerald-700' : status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} p-3 rounded-full`}>
                        {status === 'active' ? <Clock className="h-5 w-5" /> : status === 'upcoming' ? <Clock className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{cls.title}</p>
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

      {/* <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/30">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Verification Requests</CardTitle>
            </div>
            <Link to="/student-verification" className="text-sm text-primary flex items-center">
              View All Requests <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {verificationRequests.map((request) => (
              <div key={request.id} className="p-4 rounded-lg border bg-white shadow-sm">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{request.student}</h3>
                    <p className="text-sm text-muted-foreground">{request.type}</p>
                  </div>
                  <RequestBadge status={request.status} />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">Submitted {request.submitted}</span>
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg mb-4">Weekly Attendance Report</CardTitle>
            <div className="flex justify-between items-center mb-4">
              <Select
                value={weeklyBreakdownTrack}
                onValueChange={setWeeklyBreakdownTrack}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All tracks">All Tracks</SelectItem>
                  {tracksData?.map((track) => (
                    <SelectItem key={track.id} value={track.name}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBreakdown}>
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
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-4">Insights</CardTitle>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                <BarChart3 className="h-4 w-4" />
                Attendance Insight
              </div>
              <p className="text-sm text-blue-600">
                Wednesday shows a significant drop in attendance. Consider investigating potential scheduling conflicts.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                <BarChart3 className="h-4 w-4" />
                Recommendation
              </div>
              <p className="text-sm text-amber-600">
                Five students have missed multiple classes this week. Consider reaching out to them directly.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 font-medium mb-1">
                <BellRing className="h-4 w-4" />
                Improvement
              </div>
              <p className="text-sm text-emerald-600">
                Overall attendance has improved by 7% compared to last month. Keep up the good work!
              </p>
            </div>
            <Link to="/attendance-insights" className="text-sm text-primary flex items-center">
              View More Insights <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card> */}
      
      {/* Attendance Insights and Recent Absences */}
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
      <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
        In Progress
      </div>
    );
  }

  if (status === "upcoming") {
    return (
      <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
        Upcoming
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
      <Check className="h-3 w-3 mr-1" />
      Completed
    </div>
  );
};

// const RequestBadge = ({ status }) => {
//   if (status === "pending") {
//     return (
//       <div className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
//         Pending
//       </div>
//     );
//   }

//   if (status === "approved") {
//     return (
//       <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
//         <Check className="h-3 w-3 mr-1" />
//         Approved
//       </div>
//     );
//   }

//   return (
//     <div className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
//       Declined
//     </div>
//   );
// };

export default SupervisorDashboard;