import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, px } from "framer-motion";
import { Layers, Users, BarChart4, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AttendanceBarChart from "@/components/dashboard/AttendanceBarChart";
import RecentAbsences from "@/components/dashboard/RecentAbsences";
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
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosBackendInstance } from "@/api/config";
import { useQuery } from "@tanstack/react-query";
import {
  getAttendanceTrends,
  getTodaysAttendancePercentage,
} from "@/api/attendance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const pendingSupervisors = 3;
  const [selectedDailyTrendTrack, setSelectedDailyTrendTrack] = useState("all");
  const [selectedWeeklyTrendTrack, setSelectedWeeklyTrendTrack] =
    useState("all");
  const [selectedDailyBranch, setSelectedDailyBranch] = useState("all");
  const [selectedWeeklyBranch, setSelectedWeeklyBranch] = useState("all");
  const [filteredDailyTracks, setFilteredDailyTracks] = useState([]);
  const [filteredWeeklyTracks, setFilteredWeeklyTracks] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("attendance/tracks/");
      return response.data;
    },
  });

  const { data: branchesData } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("attendance/branches/");
      return response.data;
    },
  });

  const { data: lostItemsCount } = useQuery({
    queryKey: ["lostItems"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get(
        "lost-and-found/lost-items/"
      );
      return response.data.count;
    },
  });

  const { data: studentsCount } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get(
        "accounts/users/students/"
      );
      return response.data.length;
    },
  });

  const { data: supervisorsCount } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get(
        "accounts/users/supervisors/"
      );
      return response.data.length;
    },
  });

  const {
    data: dailyTrendsData,
    isLoading: dailyTrendsLoading,
    isError: dailyTrendsError,
  } = useQuery({
    queryKey: [
      "dailyAttendanceTrends",
      selectedDailyTrendTrack,
      selectedDailyBranch,
    ],
    queryFn: () =>
      getAttendanceTrends(
        selectedDailyTrendTrack === "all"
          ? null
          : parseInt(selectedDailyTrendTrack),
        selectedDailyBranch === "all" ? null : parseInt(selectedDailyBranch)
      ),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onSuccess: (data) => {
      console.log("Daily Trends Data Success:", data);
      console.log("Daily Trends:", data.daily_trends);
    },
    onError: (error) => {
      console.error("Error fetching daily trends:", error);
    },
  });

  const {
    data: weeklyTrendsData,
    isLoading: weeklyTrendsLoading,
    isError: weeklyTrendsError,
  } = useQuery({
    queryKey: [
      "weeklyAttendanceTrends",
      selectedWeeklyTrendTrack,
      selectedWeeklyBranch,
    ],
    queryFn: () =>
      getAttendanceTrends(
        selectedWeeklyTrendTrack === "all"
          ? null
          : parseInt(selectedWeeklyTrendTrack),
        selectedWeeklyBranch === "all" ? null : parseInt(selectedWeeklyBranch)
      ),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onSuccess: (data) => {
      console.log("Weekly Trends Data Success:", data);
      console.log("Weekly Trends:", data.weekly_trends);
    },
    onError: (error) => {
      console.error("Error fetching weekly trends:", error);
    },
  });
  const {
    data: todayAttendance,
    isLoading,
    isError,
    errorr,
  } = useQuery({
    queryKey: ["todayAttendancePercentage"],
    queryFn: getTodaysAttendancePercentage,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (errorr) => {
      console.error("Error fetching today's attendance:", errorr);
    },
  });

  useEffect(() => {
    if (dailyTrendsData) {
      console.log("Raw Daily Trends Data in useEffect:", dailyTrendsData);

      const currentDate = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);

      console.log("Date Range:", {
        currentDate,
        sevenDaysAgo,
      });

      // Get total students for percentage calculation
      const totalStudents = todayAttendance?.total_students || 0;

      // Transform daily trends into percentages
      const dailyFiltered = dailyTrendsData.daily_trends
        .filter((dayData) => {
          const dayDate = new Date(dayData.date);
          return dayDate >= sevenDaysAgo && dayDate <= currentDate;
        })
        .map((dayData) => ({
          date: dayData.date,
          attendance_percentage:
            totalStudents > 0
              ? Math.round((dayData.attended / totalStudents) * 100)
              : 0,
        }));

      console.log("Transformed Daily Data:", dailyFiltered);
      setDailyTrends(dailyFiltered);
    }
  }, [dailyTrendsData, todayAttendance]);

  useEffect(() => {
    if (weeklyTrendsData) {
      const currentDate = new Date();
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(currentDate.getDate() - 28);

      // Get total students for percentage calculation
      const totalStudents = todayAttendance?.total_students || 0;

      // Transform weekly trends into percentages
      const weeklyFiltered = weeklyTrendsData.weekly_trends
        .filter((weekData) => {
          const weekDate = new Date(weekData.week);
          return weekDate >= fourWeeksAgo && weekDate <= currentDate;
        })
        .map((weekData) => ({
          week: weekData.week,
          attendance_percentage:
            totalStudents > 0
              ? Math.round((weekData.attended / (totalStudents * 5)) * 100)
              : 0,
        }));

      console.log("Transformed Weekly Data:", weeklyFiltered);
      setFilteredData(weeklyFiltered);
    }
  }, [weeklyTrendsData, todayAttendance]);

  useEffect(() => {
    if (tracksData && tracksData.length > 0 && branchesData) {
      console.log("First track data:", tracksData[0]);

      // For daily trends section
      if (selectedDailyBranch === "all") {
        setFilteredDailyTracks(tracksData);
      } else {
        const branchId = parseInt(selectedDailyBranch);
        console.log("Filtering for branch ID:", branchId);

        // Find the branch name from branchesData
        const selectedBranchObj = branchesData.find(
          (branch) => branch.id === branchId
        );
        const selectedBranchName = selectedBranchObj
          ? selectedBranchObj.name
          : null;

        console.log("Selected branch name:", selectedBranchName);

        // Filter tracks where default_branch matches the name of the selected branch
        const tracksInBranch = tracksData.filter((track) => {
          // If default_branch is the branch name as string
          if (typeof track.default_branch === "string") {
            return (
              track.default_branch.toLowerCase() ===
              selectedBranchName?.toLowerCase()
            );
          }
          // If default_branch is an object with name property
          else if (
            track.default_branch &&
            typeof track.default_branch === "object" &&
            track.default_branch.name
          ) {
            return (
              track.default_branch.name.toLowerCase() ===
              selectedBranchName?.toLowerCase()
            );
          }
          return false;
        });

        console.log(
          `Filtered ${tracksInBranch.length} tracks for branch ${selectedBranchName}`
        );
        setFilteredDailyTracks(tracksInBranch);

        // If the currently selected track is not in this branch, reset to 'all'
        if (selectedDailyTrendTrack !== "all") {
          const trackId = parseInt(selectedDailyTrendTrack);
          const trackExists = tracksInBranch.some(
            (track) => track.id === trackId
          );
          if (!trackExists) {
            setSelectedDailyTrendTrack("all");
          }
        }
      }

      // For weekly trends section
      if (selectedWeeklyBranch === "all") {
        setFilteredWeeklyTracks(tracksData);
      } else {
        const branchId = parseInt(selectedWeeklyBranch);

        // Find the branch name from branchesData
        const selectedBranchObj = branchesData.find(
          (branch) => branch.id === branchId
        );
        const selectedBranchName = selectedBranchObj
          ? selectedBranchObj.name
          : null;

        // Filter tracks where default_branch matches the name of the selected branch
        const tracksInBranch = tracksData.filter((track) => {
          // If default_branch is the branch name as string
          if (typeof track.default_branch === "string") {
            return (
              track.default_branch.toLowerCase() ===
              selectedBranchName?.toLowerCase()
            );
          }
          // If default_branch is an object with name property
          else if (
            track.default_branch &&
            typeof track.default_branch === "object" &&
            track.default_branch.name
          ) {
            return (
              track.default_branch.name.toLowerCase() ===
              selectedBranchName?.toLowerCase()
            );
          }
          return false;
        });

        console.log(
          `Filtered ${tracksInBranch.length} weekly tracks for branch ${selectedBranchName}`
        );
        setFilteredWeeklyTracks(tracksInBranch);

        // If the currently selected track is not in this branch, reset to 'all'
        if (selectedWeeklyTrendTrack !== "all") {
          const trackId = parseInt(selectedWeeklyTrendTrack);
          const trackExists = tracksInBranch.some(
            (track) => track.id === trackId
          );
          if (!trackExists) {
            setSelectedWeeklyTrendTrack("all");
          }
        }
      }
    }
  }, [selectedDailyBranch, selectedWeeklyBranch, tracksData, branchesData]);

  const handleDailyBranchChange = (value) => {
    setSelectedDailyBranch(value);
  };

  const handleWeeklyBranchChange = (value) => {
    setSelectedWeeklyBranch(value);
  };

  console.log(tracksData, branchesData);
  return (
    <>
      <div className="space-y-6 p-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-red-100">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-200">
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-red-800">
                    Admin Dashboard
                  </h2>
                  <p className="text-red-700 mb-4">
                    Manage tracks, supervisors, and view system-wide analytics
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={() => navigate("/tracks/add")}>
                      Add New Track
                    </Button>
                    <Button
                      variant="outline"
                      className="relative"
                      onClick={() => navigate("/users")}
                    >
                      Manage Users
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
                    className="w-32 h-32 bg-red-200 rounded-full flex items-center justify-center"
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
                <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                  <p className="text-red-700 text-sm font-medium">
                    Total Tracks
                  </p>
                  <p className="text-2xl font-bold text-red-800">
                    {tracksData?.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                  <p className="text-red-700 text-sm font-medium">Branches</p>
                  <p className="text-2xl font-bold text-red-800">
                    {branchesData?.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                  <p className="text-red-700 text-sm font-medium">
                    Supervisors
                  </p>
                  <p className="text-2xl font-bold text-red-800">
                    {supervisorsCount}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                  <p className="text-red-700 text-sm font-medium">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-red-800">
                    {studentsCount}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                  <p className="text-red-700 text-sm font-medium">Lost Items</p>
                  <p className="text-2xl font-bold text-red-800">
                    {lostItemsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-lg">
                  Attendance Daily Trends
                </CardTitle>
                <Select
                  value={selectedDailyBranch}
                  onValueChange={handleDailyBranchChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branchesData?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedDailyTrendTrack}
                  onValueChange={setSelectedDailyTrendTrack}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tracks</SelectItem>
                    {filteredDailyTracks?.map((track) => (
                      <SelectItem key={track.id} value={track.id.toString()}>
                        {track.name} - {track.intake} - {track.program_type_display} - {track.start_date}
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
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Attendance Rate"]}
                    />
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
                <CardTitle className="text-lg">
                  Attendance Weekly Trends
                </CardTitle>
                <Select
                  value={selectedWeeklyBranch}
                  onValueChange={handleWeeklyBranchChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branchesData?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedWeeklyTrendTrack}
                  onValueChange={setSelectedWeeklyTrendTrack}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tracks</SelectItem>
                    {filteredWeeklyTracks?.map((track) => (
                      <SelectItem key={track.id} value={track.id.toString()}>
                        {track.name} - {track.intake} - {track.program_type_display} - {track.start_date}
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
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Attendance Rate"]}
                    />
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
      </div>
    </>
  );
};

export default AdminDashboard;
