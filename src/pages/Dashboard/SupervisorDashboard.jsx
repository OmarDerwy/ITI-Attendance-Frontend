import React from 'react';
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
import RecentAbsences from '../../components/dashboard/RecentAbsences';
const attendanceData = [
  { name: "Mon", attendance: 85, absence: 15 },
  { name: "Tue", attendance: 88, absence: 12 },
  { name: "Wed", attendance: 70, absence: 30 },
  { name: "Thu", attendance: 95, absence: 5 },
  { name: "Fri", attendance: 80, absence: 20 },
];

const trendsData = [
  { week: "Week 1", attendance: 78 },
  { week: "Week 2", attendance: 82 },
  { week: "Week 3", attendance: 75 },
  { week: "Week 4", attendance: 85 },
  { week: "Week 5", attendance: 90 },
];

const verificationRequests = [
  { id: 1, student: "Alex Morgan", type: "Medical Leave", submitted: "2 hours ago", status: "pending" },
  { id: 2, student: "Jamie Smith", type: "Attendance Correction", submitted: "1 day ago", status: "pending" },
  { id: 3, student: "Taylor Johnson", type: "Late Arrival", submitted: "3 days ago", status: "approved" },
];

const trackAttendance = [
  { name: "Web Dev", value: 95 },
  { name: "Mobile", value: 88 },
  { name: "Data Science", value: 78 },
];
const recentAbsences = [
  { id: 1, student: "Alice Johnson", date: "Jun 15, 2023", reason: "Sick leave", status: "excused" },
  { id: 2, student: "Bob Smith", date: "Jun 14, 2023", reason: "Family event", status: "pending" },
  { id: 3, student: "Charlie Brown", date: "Jun 12, 2023", reason: "N/A", status: "unexcused" },
  { id: 4, student: "Diana Ross", date: "Jun 9, 2023", reason: "Medical appointment", status: "excused" },
];
const SupervisorDashboard = () => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 text-center border border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                <Check className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700">87.5%</div>
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
            <div className="text-2xl font-bold text-blue-700">92%</div>
            <CardDescription>Weekly Average</CardDescription>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center border border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700">5</div>
            <CardDescription>Verification Requests</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg">Track Attendance</CardTitle>
              <Link to="/attendance-insights" className="text-sm text-primary flex items-center">
                View Detailed Analytics <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trackAttendance}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trackAttendance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="text-lg mb-4">Attendance Trends</CardTitle>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
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
            <CardTitle className="text-lg">Today's Classes</CardTitle>
            <Link to="/schedule" className="text-sm text-primary flex items-center">
              View Full Schedule <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg border shadow-sm bg-gradient-to-r from-gray-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Web Development</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>09:00 - 11:00</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                    <span>Room 101</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                    <Users className="h-3.5 w-3.5" />
                    <span>28/30</span>
                  </div>
                </div>
              </div>
              <ClassBadge status="completed" />
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border shadow-sm bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Data Structures</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>11:30 - 13:30</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                    <span>Room 203</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                    <Users className="h-3.5 w-3.5" />
                    <span>25/25</span>
                  </div>
                </div>
              </div>
              <ClassBadge status="active" />
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border shadow-sm bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Database Systems</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>14:00 - 16:00</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                    <span>Room 102</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
                    <Users className="h-3.5 w-3.5" />
                    <span>22/25</span>
                  </div>
                </div>
              </div>
              <ClassBadge status="upcoming" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/30">
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
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-4">Weekly Attendance Report</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Legend />
                <Bar dataKey="attendance" name="Present %" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absence" name="Absent %" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
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
        </Card>
              {/* Attendance Insights and Recent Absences */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentAbsences 
                  absences={recentAbsences}
                  onViewAll={() => navigate("/attendance-reports")}
                />
              </div>
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="text-lg mb-4">Quick Actions</CardTitle>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/schedule">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100/30 hover:bg-blue-100/50 border-blue-200">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span>View Schedule</span>
                </Button>
              </Link>
              <Link to="/attendance-insights">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100/30 hover:bg-emerald-100/50 border-emerald-200">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                  <span>Attendance Analytics</span>
                </Button>
              </Link>
              <Link to="/student-verification">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100/30 hover:bg-amber-100/50 border-amber-200">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <span>Verification Requests</span>
                </Button>
              </Link>
              <Link to="/announcements">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100/30 hover:bg-purple-100/50 border-purple-200">
                  <BellRing className="h-6 w-6 text-purple-600" />
                  <span>Create Announcement</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
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

const RequestBadge = ({ status }) => {
  if (status === "pending") {
    return (
      <div className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        Pending
      </div>
    );
  }
  
  if (status === "approved") {
    return (
      <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <Check className="h-3 w-3 mr-1" />
        Approved
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        Declined
    </div>
  );
};

export default SupervisorDashboard;
