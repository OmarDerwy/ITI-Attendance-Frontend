
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Users, BarChart4, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceBarChart from '@/components/dashboard/AttendanceBarChart';
import RecentAbsences from '@/components/dashboard/RecentAbsences';
import QuickActions from '@/components/dashboard/QuickActions';
import AnnouncementCard from '@/components/dashboard/AnnouncementCard';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const pendingSupervisors = 3;

  // Mock data
  const attendanceData = [
    { name: "Mon", attendance: 85, absence: 15, color: "#ea384c" },
    { name: "Tue", attendance: 88, absence: 12, color: "#ea384c" },
    { name: "Wed", attendance: 70, absence: 30, color: "#ea384c" },
    { name: "Thu", attendance: 95, absence: 5, color: "#ea384c" },
    { name: "Fri", attendance: 80, absence: 20, color: "#ea384c" },
  ];

  const insightsData = [
    { date: "Week 1", rate: 75 },
    { date: "Week 2", rate: 80 },
    { date: "Week 3", rate: 78 },
    { date: "Week 4", rate: 85 },
    { date: "Week 5", rate: 82 },
    { date: "Week 6", rate: 90 },
    { date: "Week 7", rate: 88 },
    { date: "Week 8", rate: 92 },
  ];

  const trackData = [
    { name: "Web Dev", students: 65, percentage: 40, color: "#ea384c" },
    { name: "Mobile", students: 45, percentage: 30, color: "#f16b7a" },
    { name: "Data Science", students: 30, percentage: 20, color: "#f79da7" },
    { name: "UI/UX", students: 16, percentage: 10, color: "#fbd0d5" },
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

  return (
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
                <h2 className="text-2xl font-bold mb-2 text-red-800">Admin Dashboard</h2>
                <p className="text-red-700 mb-4">
                  Manage tracks, supervisors, and view system-wide analytics
                </p>
                <div className="flex space-x-2">
                  <Button onClick={() => navigate('/admin/tracks')}>Add New Track</Button>
                  <Button 
                    variant="outline" 
                    className="relative"
                    onClick={() => navigate('/admin/verify-supervisors')}
                  >
                    Manage Supervisors
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex justify-end">
                <motion.div 
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5,
                    ease: "easeInOut" 
                  }}
                  className="w-32 h-32 bg-red-200 rounded-full flex items-center justify-center"
                >
                  <Users className="h-16 w-16 text-red-600" />
                </motion.div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                <p className="text-red-700 text-sm font-medium">Total Tracks</p>
                <p className="text-2xl font-bold text-red-800">5</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                <p className="text-red-700 text-sm font-medium">Supervisors</p>
                <p className="text-2xl font-bold text-red-800">12</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                <p className="text-red-700 text-sm font-medium">Students</p>
                <p className="text-2xl font-bold text-red-800">156</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
                <p className="text-red-700 text-sm font-medium">Lost Items</p>
                <p className="text-2xl font-bold text-red-800">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart4 className="mr-2 h-5 w-5 text-red-600" />
                Attendance Analytics
              </CardTitle>
              <CardDescription>
                System-wide attendance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                    <Bar dataKey="attendance" name="Attendance Rate" fill="#ea384c">
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#ea384c" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-3 border border-red-200 rounded-md bg-red-50">
                <p className="font-medium mb-1">AI Insights:</p>
                <p className="text-sm text-gray-600">
                  Students most frequently forget to check out on Thursdays, with a 23% higher incidence rate than other days of the week.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => navigate('/admin/tracks')}
              >
                View Track Analytics
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-red-600" />
                Lost & Found Insights
              </CardTitle>
              <CardDescription>
                Analysis of lost and found items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trackData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        fill="#ea384c"
                        paddingAngle={2}
                        dataKey="percentage"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {trackData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              
                <div className="border border-red-100 rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Most Common Items</p>
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center text-sm">
                            <span className="flex-1">Water Bottles</span>
                            <span className="font-medium">24%</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="flex-1">ID Cards</span>
                            <span className="font-medium">18%</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="flex-1">USB Drives</span>
                            <span className="font-medium">12%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-red-100 rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Common Locations</p>
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center text-sm">
                            <span className="flex-1">Cafeteria</span>
                            <span className="font-medium">32%</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="flex-1">Library</span>
                            <span className="font-medium">27%</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="flex-1">Classrooms</span>
                            <span className="font-medium">22%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Attendance Bar Chart */}
        <div className="md:col-span-2">
          <AttendanceBarChart 
            data={attendanceData}
            title="Weekly Attendance"
            description="Daily attendance rate for this week"
            period={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
      
      </div>
      
      {/* Announcements */}
      <div className="mb-6">
        <AnnouncementCard announcements={mockAnnouncements} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default AdminDashboard;
