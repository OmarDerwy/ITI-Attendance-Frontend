
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { axiosBackendInstance } from "@/api/config";
import OnlineVsOfflineCard from "@/components/dashboard/OnlineVsOfflineCard";
import { Skeleton } from "@/components/ui/skeleton";

const BranchManagerDashboard = () => {
  const navigate = useNavigate();

  // Get the branch ID from user context or state management
  // For now, using a hardcoded value
  const branchId = 8;

  // Queries for dashboard data
  const { data: tracksStatisticsData, isLoading: isTracksLoading } = useQuery({
    queryKey: ["tracksStatistics", branchId],
    queryFn: async () => {
      const response = await axiosBackendInstance.get(`attendance/tracks/branch_statistics?branch_id=${branchId}&is_active=true`);
      return response.data;
    },
  });
  
  const { data: lostItemsCount, isLoading: isLostItemsLoading } = useQuery({
    queryKey: ["lostItems"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("lost-and-found/lost-items/");
      return response.data.count;
    },
  });

  const { data: studentsCount, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("accounts/users/students/");
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
      monthlyData: track.statistics.monthly_summary.map(month => ({
        year: month.year,
        month: month.month - 1, // JavaScript months are 0-indexed
        monthName: month.month_name,
        onlineDays: month.online_days,
        offlineDays: month.offline_days,
        totalDays: month.total_days,
        onlinePercentage: month.online_percentage,
        offlinePercentage: month.offline_percentage
      })),
      // Adding daily data for detailed view
      dailyData: track.daily_data.map(day => ({
        date: new Date(day.date),
        isOnline: day.type === "online"
      }))
    }));
  }, [tracksStatisticsData]);

  // Count active tracks
  const activeTracksCount = React.useMemo(() => {
    if (!tracksStatisticsData) return 0;
    return tracksStatisticsData.filter(track => track.is_active).length;
  }, [tracksStatisticsData]);

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-border dark:border-border/20">
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 p-6 border-b border-red-200 dark:border-red-900/30">
        <div className="grid md:grid-cols-2 gap-4 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-red-800 dark:text-red-400">
                  Branch Manager Dashboard
                </h2>
                <p className="text-red-700 dark:text-red-300/90 mb-4">
                  View tracks, manage coordinators, and view branch analytics
                </p>
                <div className="flex space-x-2">
                  <Button onClick={() => navigate("/tracks/view")}>
                    View Tracks
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/coordinators")}
                  >
                    Manage Coordinators
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex justify-end">
                <motion.div
                  animate={{
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                  className="w-32 h-32 bg-red-200 dark:bg-red-950/40 rounded-full flex items-center justify-center"
                >
                  <img
                    src="/images/iti-logo.png"
                    alt="logo"
                    className="h-28"
                  />
                </motion.div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Total Tracks</p>
                {isTracksLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{tracksStatisticsData?.length || 0}</p>
                )}
              </div>
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Active Tracks</p>
                {isTracksLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{activeTracksCount}</p>
                )}
              </div>
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Total Students</p>
                {isStudentsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{studentsCount || 0}</p>
                )}
              </div>
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Lost Items</p>
                {isLostItemsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{lostItemsCount || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default BranchManagerDashboard;
