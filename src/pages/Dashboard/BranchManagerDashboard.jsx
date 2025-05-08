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

const BranchManagerDashboard = () => {
  const navigate = useNavigate();

  // Queries for dashboard data
  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("attendance/tracks/");
      return response.data;
    },
  });
  const { data: lostItemsCount } = useQuery({
    queryKey: ["lostItems"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("lost-and-found/lost-items/");
      return response.data.count;
    },
  });

  const { data: studentsCount } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("accounts/users/students/");
      return response.data.length;
    },
  });

  const { data: supervisorsCount } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("accounts/users/supervisors/");
      return response.data.length;
    },
  });

  // Prepare track data for OnlineVsOfflineCard
  const trackAttendanceData = React.useMemo(() => {
    if (!tracksData) return [];
    
    return tracksData.map((track) => ({
      id: track.id,
      name: track.name,
      onlinePercentage: track.online_attendance_percentage || 0,
      offlinePercentage: track.offline_attendance_percentage || 0,
      onlineDays: track.online_days || 0,
      offlineDays: track.offline_days || 0,
      color: track.color || "#3b82f6",
    }));
  }, [tracksData]);

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
                <p className="text-2xl font-bold">{tracksData?.length}</p>
              </div>
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Active Tracks</p>
                <p className="text-2xl font-bold">{tracksData?.length}</p>
              </div>
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Supervisors</p>
                <p className="text-2xl font-bold">{supervisorsCount}</p>
              </div>
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{studentsCount}</p>
              </div>
              <div className="rounded-lg p-4 text-center border border-border/30 shadow-sm bg-card">
                <p className="text-primary text-sm font-medium">Lost Items</p>
                <p className="text-2xl font-bold">{lostItemsCount}</p>
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
        <OnlineVsOfflineCard trackData={trackAttendanceData} />
      </motion.div>
    </div>
  );
};

export default BranchManagerDashboard;