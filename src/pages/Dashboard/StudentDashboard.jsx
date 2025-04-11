import React from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckSquare, Search, Flag, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TrackBranchCard from "@/components/dashboard/TrackBranchCard";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";
import ItiValuesCard from "@/components/dashboard/ItiValuesCard";
import Layout from "@/components/layout/Layout";
import CombinedScheduleCard from "../../components/dashboard/CombinedScheduleCard";

const StudentDashboard = () => {
  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
            <AttendanceCalendar />
          </div>
          <div className="md:col-span-5 space-y-6">
            <TrackBranchCard />
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <ItiValuesCard />
              </CardContent>
            </Card>
          </div>
        </div>
          <div>
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
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-0"
                  >
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <span>View Schedule</span>
                  </Button>
                </Link>
                <Link to="/leave-request-form" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 border-0"
                  >
                    <CheckSquare className="h-6 w-6 text-purple-600" />
                    <span>Request Leave</span>
                  </Button>
                </Link>
                <Link to="/report-lost-found" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 border-0"
                  >
                    <Flag className="h-6 w-6 text-amber-600" />
                    <span>Report Lost Item</span>
                  </Button>
                </Link>
                <Link to="/lost-found" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-0"
                  >
                    <Search className="h-6 w-6 text-emerald-600" />
                    <span>Lost & Found</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default StudentDashboard;
