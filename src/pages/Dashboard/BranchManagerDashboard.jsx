import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { axiosBackendInstance } from "@/api/config";
import OnlineVsOfflineCard from "@/components/dashboard/OnlineVsOfflineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon, UsersIcon, BookOpenIcon, GraduationCapIcon, BarChartIcon } from "lucide-react";

const BranchManagerDashboard = () => {
  const navigate = useNavigate();
  // Queries for dashboard data
  const { data: tracksStatisticsData, isLoading: isTracksLoading } = useQuery({
    queryFn: async () => {
      const response = await axiosBackendInstance.get(
        `attendance/tracks/branch_statistics?is_active=true`
      );
      return response.data;
    },
  });
  const { data: studentsCount, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get(
        "accounts/users/students/"
      );
      return response.data.length;
    },
  });
  const { data: tracksCount } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("attendance/tracks/");
      return response.data.length;
    },
  });

  // Prepare track data for OnlineVsOfflineCard
  const trackAttendanceData = React.useMemo(() => {
    if (!tracksStatisticsData) return [];

    return tracksStatisticsData.map((track) => ({
      id: track.track_id,
      name: track.track_name,
      programType: track.program_type_display,
      intake: track.intake,
      startDate: track.start_date,
      onlinePercentage: track.statistics.online_percentage || 0,
      offlinePercentage: track.statistics.offline_percentage || 0,
      onlineDays: track.statistics.online_days || 0,
      offlineDays: track.statistics.offline_days || 0,
      color: "#3b82f6", // Default color since it's not in the API response
      // Adding monthly data for the calendar view
      monthlyData: track.statistics.monthly_summary.map((month) => ({
        year: month.year,
        month: month.month - 1, // JavaScript months are 0-indexed
        monthName: month.month_name,
        onlineDays: month.online_days,
        offlineDays: month.offline_days,
        totalDays: month.total_days,
        onlinePercentage: month.online_percentage,
        offlinePercentage: month.offline_percentage,
      })),
      // Adding daily data for detailed view
      dailyData: track.daily_data.map((day) => ({
        date: new Date(day.date),
        isOnline: day.type === "online",
      })),
    }));
  }, [tracksStatisticsData]);

  // Count active tracks
  const activeTracksCount = React.useMemo(() => {
    if (!tracksStatisticsData) return 0;
    return tracksStatisticsData.length;
  }, [tracksStatisticsData]);

  return (
    <div className="space-y-6 p-4 min-h-screen">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Branch Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/tracks/view")}
            className="group"
          >
            View Tracks
            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/coordinators")}
          >
            Manage Coordinators
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Tracks Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch h-full">
                <div className="bg-primary/10 p-4 flex items-center justify-center">
                  <BookOpenIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="p-4 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Tracks</p>
                  {isTracksLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold">{tracksCount || 0}</p>
                      <p className="text-xs text-muted-foreground ml-2">tracks</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Tracks Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch h-full">
                <div className="bg-primary/10 p-4 flex items-center justify-center">
                  <GraduationCapIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="p-4 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Tracks</p>
                  {isTracksLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold">{activeTracksCount}</p>
                      <p className="text-xs text-muted-foreground ml-2">active</p>
                    </div>
                  )}
   
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch h-full">
                <div className="bg-primary/10 p-4 flex items-center justify-center">
                  <UsersIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="p-4 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  {isStudentsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold">{studentsCount || 0}</p>
                      <p className="text-xs text-muted-foreground ml-2">enrolled</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>



      {/* Online vs Offline Attendance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isTracksLoading ? (
          <Card className="p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </Card>
        ) : (
          <OnlineVsOfflineCard trackData={trackAttendanceData} />
        )}
      </motion.div>

            {/* Quick Actions */}
            <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Quick Actions</h3>
              <BarChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                className="w-full justify-start group" 
                size="lg"
                onClick={() => navigate("/tracks/view")}
              >
                <BookOpenIcon className="mr-2 h-5 w-5" />
                View All Tracks
                <ArrowRightIcon className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
                onClick={() => navigate("/coordinators")}
              >
                <UsersIcon className="mr-2 h-5 w-5" />
                Manage Coordinators
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BranchManagerDashboard;