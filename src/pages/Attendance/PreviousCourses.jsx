
import { useState } from "react";
import { Calendar, Clock, UserCheck, UserX, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PreviousCourses = () => {
  const [month, setMonth] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for previous courses
  const previousCourses = [
    {
      id: 1,
      courseName: "Introduction to Programming",
      date: "2023-06-10",
      time: "09:00 - 11:00",
      location: "Room 101",
      instructor: "Dr. Smith",
      attended: true,
    },
    {
      id: 2,
      courseName: "Data Structures",
      date: "2023-06-05",
      time: "13:00 - 15:00",
      location: "Room 202",
      instructor: "Dr. Johnson",
      attended: false,
    },
    {
      id: 3,
      courseName: "Database Management",
      date: "2023-05-28",
      time: "10:00 - 12:00",
      location: "Room 105",
      instructor: "Prof. Williams",
      attended: true,
    },
    {
      id: 4,
      courseName: "Web Development",
      date: "2023-05-22",
      time: "14:00 - 16:00",
      location: "Computer Lab 2",
      instructor: "Ms. Davis",
      attended: true,
    },
    {
      id: 5,
      courseName: "Machine Learning",
      date: "2023-05-15",
      time: "09:00 - 12:00",
      location: "Room 304",
      instructor: "Dr. Brown",
      attended: false,
    },
  ];

  // Filter courses by month and search query
  const filteredCourses = previousCourses.filter((course) => {
    const courseDate = new Date(course.date);
    const courseMonth = courseDate.getMonth() + 1;
    
    const monthFilter = month === "all" || parseInt(month) === courseMonth;
    
    const searchFilter = 
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return monthFilter && searchFilter;
  });

  // Calculate attendance percentage
  const totalCourses = previousCourses.length;
  const attendedCourses = previousCourses.filter(course => course.attended).length;
  const attendancePercentage = Math.round((attendedCourses / totalCourses) * 100);

  return (
    <Layout>
      <PageTitle
        title="Previous Courses"
        subtitle="View your course history and attendance record"
        icon={<Calendar />}
      />

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="text-sm font-medium">Total Courses</p>
                  <h4 className="text-2xl font-bold">{totalCourses}</h4>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-medium">Courses Attended</p>
                  <h4 className="text-2xl font-bold">{attendedCourses}</h4>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="h-8 w-8 mr-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-bold">{attendancePercentage}%</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Attendance Rate</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div 
                      className="h-2 rounded-full bg-primary" 
                      style={{ width: `${attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-lg font-medium">Course History</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCourses.length > 0 ? (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{course.courseName}</h4>
                          <Badge 
                            variant={course.attended ? "default" : "destructive"}
                            className="ml-2"
                          >
                            {course.attended ? "Attended" : "Absent"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.instructor}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{new Date(course.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{course.time}</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Location: {course.location}
                      </span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No courses found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters to find courses
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PreviousCourses;
