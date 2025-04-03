
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Check, CheckSquare, Clock, Search, ArrowRight, Bell, Flag } from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnnouncementCard from '@/components/dashboard/AnnouncementCard';

// Attendance analytics data
const weeklyData = [
  { day: 'Mon', value: 1 },
  { day: 'Tue', value: 1 },
  { day: 'Wed', value: 1 },
  { day: 'Thu', value: 0 },
  { day: 'Fri', value: 1 },
];

const mockAnnouncements = [
  {
    id: 1,
    title: "New Track Added: Cybersecurity",
    content: "We're excited to announce a new Cybersecurity track starting next month. Applications are now open.",
    createdAt: "2023-06-10T09:30:00",
    isPinned: true
  },
  {
    id: 2,
    title: "System Maintenance",
    content: "The attendance system will be undergoing maintenance this weekend. Please record attendance manually.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isPinned: false
  },
  {
    id: 3,
    title: "End of Term Evaluations",
    content: "Please complete all student evaluations by the end of next week.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    isPinned: false
  }
];


const StudentDashboard = () => {
  const { toast } = useToast();
  // const [checkInStatus, setCheckInStatus] = useState("not-checked-in");

  // const handleCheckIn = () => {
  //   setCheckInStatus("checked-in");
  //   toast({
  //     title: "Checked In Successfully",
  //     description: "Your attendance has been recorded.",
  //   });
  // };

  // const handleCheckOut = () => {
  //   setCheckInStatus("checked-out");
  //   toast({
  //     title: "Checked Out Successfully",
  //     description: "Have a great day!",
  //   });
  // };

  // Attendance pie chart data
  const pieData = [
    { name: 'Present', value: 113 },
    { name: 'Absent', value: 7 }
  ];
  const COLORS = ['#10b981', '#f87171'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <CheckSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center mb-6">
                <CardTitle className="mb-2">Today's Attendance</CardTitle>
                <CardDescription>June 16, 2023</CardDescription>
              </div>
              
              {checkInStatus === "not-checked-in" && (
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleCheckIn}>
                  Check In
                </Button>
              )}
              
              {checkInStatus === "checked-in" && (
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-md">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Checked In at 9:03 AM</span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleCheckOut}>
                    Check Out
                  </Button>
                </div>
              )}
              
              {checkInStatus === "checked-out" && (
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-md">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Checked Out at 5:15 PM</span>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    You've completed your attendance for today.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card> */}

        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <CardTitle className="mb-4">Attendance Statistics</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Days</span>
                  <span className="font-medium">120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Days Present</span>
                  <span className="font-medium text-emerald-600">113</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Days Absent</span>
                  <span className="font-medium text-red-500">7</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <span className="text-emerald-600 font-medium">94.2%</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: "94.2%" }}></div>
                </div>
                
                <div className="text-xs text-right text-muted-foreground">
                  {7} days absence remaining before warning
                </div>
              </div>
              
              <div className="h-44 sm:h-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Announcements */}
      <div className="mb-6">
        <AnnouncementCard announcements={mockAnnouncements} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Today's Schedule</CardTitle>
            <Link to="/schedule" className="text-sm text-primary flex items-center">
              View Full Schedule <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg border bg-gradient-to-r from-gray-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Web Development</p>
                  <p className="text-sm text-muted-foreground">09:00 - 11:00, Room 101</p>
                </div>
              </div>
              <Badge status="completed" />
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Data Structures</p>
                  <p className="text-sm text-muted-foreground">11:30 - 13:30, Room 203</p>
                </div>
              </div>
              <Badge status="active" />
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Database Systems</p>
                  <p className="text-sm text-muted-foreground">14:00 - 16:00, Room 102</p>
                </div>
              </div>
              <Badge status="upcoming" />
            </div>
          </div>
        </CardContent>
      </Card>



      <Card>
        <CardContent className="pt-6">
          <CardTitle className="mb-4">Quick Actions</CardTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/schedule">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100/30 hover:bg-blue-100/50 border-blue-200">
                <Calendar className="h-6 w-6 text-blue-600" />
                <span>View Schedule</span>
              </Button>
            </Link>
            <Link to="/previous-courses">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100/30 hover:bg-purple-100/50 border-purple-200">
                <CheckSquare className="h-6 w-6 text-purple-600" />
                <span>Attendance History</span>
              </Button>
            </Link>
            <Link to="/report-lost-found">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100/30 hover:bg-amber-100/50 border-amber-200">
                <Flag className="h-6 w-6 text-amber-600" />
                <span>Report Lost Item</span>
              </Button>
            </Link>
            <Link to="/lost-found">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100/30 hover:bg-emerald-100/50 border-emerald-200">
                <Search className="h-6 w-6 text-emerald-600" />
                <span>Lost & Found</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Badge = ({ status }) => {
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

export default StudentDashboard;
