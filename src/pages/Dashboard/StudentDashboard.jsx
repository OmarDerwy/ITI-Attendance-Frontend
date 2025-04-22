import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckSquare, Search, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TrackBranchCard from "@/components/dashboard/TrackBranchCard";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";
import ItiValuesCard from "@/components/dashboard/ItiValuesCard";
import Layout from "@/components/layout/Layout";
import CombinedScheduleCard from "../../components/dashboard/CombinedScheduleCard";
import AbsenceWarningCard from "@/components/dashboard/AbsenceWarningCard";
import { useUser } from "@/context/UserContext";
import { axiosBackendInstance } from "@/api/config";
import { parseISO, isToday, isBefore, isAfter, format } from "date-fns";

const StudentDashboard = () => {
  const [todayClasses, setTodayClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { studentTrack } = useUser();

  useEffect(() => {
    if (studentTrack) {
      fetchTodayClasses(studentTrack.track.id);
    } else {
      setIsLoading(false);
    }
  }, [studentTrack]);

  const fetchTodayClasses = async (trackId) => {
    try {
      const response = await axiosBackendInstance.get(
        `attendance/sessions/calendar-data/?track_id=${trackId}`
      );
      
      const currentTime = new Date();
      
      // Process events for today
      const allEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,
        instructor: event.instructor,
        start: parseISO(event.start),
        end: parseISO(event.end),
        isOnline: event.is_online,
        branch: event.branch,
      }));
      
      // Filter today's classes
      const todayEvents = allEvents.filter(event => isToday(event.start));
      
      // Determine status for today's classes
      const processedTodayEvents = todayEvents.map(event => {
        let status = "upcoming";
        if (isBefore(event.end, currentTime)) {
          status = "completed";
        } else if (isAfter(event.end, currentTime) && isBefore(event.start, currentTime)) {
          status = "active";
        }
        
        return {
          ...event,
          time: `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`,
          status
        };
      });
      
      // Sort today's events by start time
      processedTodayEvents.sort((a, b) => a.start - b.start);
      
      setTodayClasses(processedTodayEvents);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching today's classes:", error);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
            <AttendanceCalendar />
          </div>
          <div className="md:col-span-5 space-y-6">
            <TrackBranchCard />
            <Card className="overflow-hidden">
                <AbsenceWarningCard compact={true} />
            </Card>
          </div>
        </div>
          <div >
            <CombinedScheduleCard />
          </div>
        
        <div className="w-full">
          <Card className="w-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link to="/student-schedule" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border-0"
                  >
                    <div className="bg-primary/20 p-2 rounded-full text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className="text-primary font-medium">View Schedule</span>
                  </Button>
                </Link>
                <Link to="/leave-request-form" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-blue-100/50 hover:bg-blue-100 border-0"
                  >
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <span className="text-blue-700 font-medium">Request Leave</span>
                  </Button>
                </Link>
                <Link to="/report-lost-found" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-amber-100/50 hover:bg-amber-100 border-0"
                  >
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                      <Flag className="h-5 w-5" />
                    </div>
                    <span className="text-amber-700 font-medium">Report Lost Item</span>
                  </Button>
                </Link>
                <Link to="/lost-found" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-emerald-100/50 hover:bg-emerald-100 border-0"
                  >
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                      <Search className="h-5 w-5" />
                    </div>
                    <span className="text-emerald-700 font-medium">Lost & Found</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
