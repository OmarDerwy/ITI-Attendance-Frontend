
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  BarChart3, 
  Users, 
  AlertTriangle,
  Brain,
  Lightbulb,
  Calendar,
  User,
  Clock,
  Filter
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const AttendanceInsights = () => {
  const { userRole } = useUser();
  const { toast } = useToast();
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const tracks = [
    { id: "all", name: "All Tracks" },
    { id: "frontend", name: "Frontend Development" },
    { id: "backend", name: "Backend Development" },
    { id: "fullstack", name: "Full Stack" },
    { id: "mobile", name: "Mobile Development" },
  ];

  // Mock data for attendance trends
  const attendanceTrends = [
    { date: 'Mon', attendance: 92 },
    { date: 'Tue', attendance: 88 },
    { date: 'Wed', attendance: 94 },
    { date: 'Thu', attendance: 78 },
    { date: 'Fri', attendance: 70 },
  ];

  // Mock data for attendance by track
  const attendanceByTrack = [
    { track: 'Frontend', attendance: 88 },
    { track: 'Backend', attendance: 92 },
    { track: 'Full Stack', attendance: 85 },
    { track: 'Mobile', attendance: 79 },
    { track: 'UI/UX', attendance: 93 },
  ];

  // Mock anomalies data (unusual patterns)
  const anomalies = [
    {
      id: 1,
      title: "Unusual drop in attendance",
      description: "There's a significant drop in attendance on Thursdays for Backend track students.",
      severity: "high",
      dateDetected: "2023-08-15",
      affectedGroups: ["Backend track", "Morning sessions"],
      possibleReasons: ["Schedule conflict with another important class", "Transportation issues"]
    },
    {
      id: 2,
      title: "Specific student group absence pattern",
      description: "5 students from the Mobile track have missed 3 consecutive Monday classes.",
      severity: "medium",
      dateDetected: "2023-08-10",
      affectedGroups: ["Mobile track", "Group B"],
      possibleReasons: ["External workshop attendance", "Project deadline conflicts"]
    },
    {
      id: 3,
      title: "Punctuality issue in specific location",
      description: "Students in Room 305 consistently arrive 10-15 minutes late on Tuesdays.",
      severity: "low",
      dateDetected: "2023-08-12",
      affectedGroups: ["Multiple tracks", "Room 305"],
      possibleReasons: ["Previous class in distant location", "Building access issues"]
    }
  ];

  // Mock at-risk students
  const atRiskStudents = [
    { id: 1, name: "Ahmed Hassan", attendance: 45, track: "Frontend", lastAttended: "2023-08-10", pattern: "Monday absences" },
    { id: 2, name: "Sarah Mohamed", attendance: 52, track: "Backend", lastAttended: "2023-08-12", pattern: "Irregular attendance" },
    { id: 3, name: "Yousef Ali", attendance: 48, track: "Mobile", lastAttended: "2023-08-09", pattern: "Frequent early departures" },
    { id: 4, name: "Layla Ibrahim", attendance: 53, track: "Frontend", lastAttended: "2023-08-11", pattern: "Late arrivals" }
  ];

  // Filter at-risk students by track and search query
  const filteredStudents = atRiskStudents.filter(student => 
    (selectedTrack === "all" || student.track.toLowerCase() === selectedTrack.toLowerCase()) &&
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter anomalies by track
  const filteredAnomalies = anomalies.filter(anomaly => 
    selectedTrack === "all" || 
    anomaly.affectedGroups.some(group => 
      group.toLowerCase().includes(selectedTrack.toLowerCase())
    )
  );

  const handleTrackChange = (track) => {
    setSelectedTrack(track);
  };

  const handleGenerateInsights = () => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Insights Generated",
        description: "New attendance insights have been generated based on the latest data.",
      });
    }, 2000);
  };

  // Access control - only admin and supervisors can see this page
  if (userRole !== "admin" && userRole !== "supervisor") {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTitle
        title="Attendance Insights"
        subtitle="AI-powered analysis and anomaly detection for attendance patterns"
        icon={<Brain />}
        action={
          <Button onClick={handleGenerateInsights} disabled={isLoading}>
            {isLoading ? "Processing..." : "Generate New Insights"}
          </Button>
        }
      />

      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-auto flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedTrack === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTrackChange("all")}
            >
              All Tracks
            </Button>
            {tracks.slice(1).map(track => (
              <Button
                key={track.id}
                variant={selectedTrack === track.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleTrackChange(track.id)}
              >
                {track.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Average Attendance Rate"
            value="84%"
            trend={{ value: 2.5, isPositive: true }}
            icon={<Users className="h-5 w-5" />}
          />
          
          <StatsCard
            title="At-Risk Students"
            value={atRiskStudents.length}
            trend={{ value: 1.2, isPositive: false }}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          
          <StatsCard
            title="Detected Anomalies"
            value={anomalies.length}
            trend={{ value: 3.8, isPositive: false }}
            icon={<Lightbulb className="h-5 w-5" />}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="atrisk">At-Risk Students</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <h3 className="text-lg font-medium">Weekly Attendance Trend</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <ChartContainer
                    className="aspect-[4/3]"
                    config={{
                      attendance: { color: '#3b82f6' }
                    }}
                  >
                    <LineChart data={attendanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="attendance" 
                        name="Attendance %" 
                        stroke="var(--color-attendance)" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <h3 className="text-lg font-medium">Attendance by Track</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <ChartContainer
                    className="aspect-[4/3]"
                    config={{
                      attendance: { color: '#8b5cf6' }
                    }}
                  >
                    <BarChart data={attendanceByTrack}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="track" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar 
                        dataKey="attendance" 
                        name="Attendance %" 
                        fill="var(--color-attendance)" 
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">AI-Generated Insights</h3>
                  <Brain className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      Time-based Pattern
                    </h4>
                    <p className="mt-1 text-sm">
                      Attendance drops by an average of 12% for afternoon classes compared to morning classes across all tracks.
                      Consider investigating potential causes like lunch breaks, fatigue, or transportation issues.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-green-500" />
                      Track Correlation
                    </h4>
                    <p className="mt-1 text-sm">
                      Frontend and UI/UX tracks have the highest correlation in attendance patterns (0.87), suggesting these students may have 
                      similar schedules or motivations. Consider aligning course content or schedules.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Seasonal Insight
                    </h4>
                    <p className="mt-1 text-sm">
                      Historical data shows a 15% attendance decline during the final two weeks of the semester. 
                      Consider implementing engagement strategies or critical content coverage earlier in the term.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="anomalies" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Detected Attendance Anomalies</h3>
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {filteredAnomalies.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAnomalies.map((anomaly) => (
                      <div key={anomaly.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{anomaly.title}</h4>
                              <Badge 
                                variant={
                                  anomaly.severity === "high" ? "destructive" : 
                                  anomaly.severity === "medium" ? "default" : 
                                  "outline"
                                }
                              >
                                {anomaly.severity}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Detected on {anomaly.dateDetected}
                            </p>
                          </div>
                          
                          <Button variant="outline" size="sm">Investigate</Button>
                        </div>
                        
                        <p className="mt-3 text-sm">{anomaly.description}</p>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-1">Affected Groups</h5>
                            <div className="flex flex-wrap gap-1">
                              {anomaly.affectedGroups.map((group, index) => (
                                <Badge key={index} variant="outline">{group}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-1">Possible Reasons</h5>
                            <ul className="list-disc pl-4 text-sm text-muted-foreground">
                              {anomaly.possibleReasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                    <h3 className="mt-4 text-lg font-medium">No anomalies found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTrack === "all" 
                        ? "No attendance anomalies have been detected." 
                        : `No attendance anomalies detected for the ${tracks.find(t => t.id === selectedTrack)?.name} track.`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="atrisk" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="text-lg font-medium">At-Risk Students</h3>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Advanced Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <div className="space-y-4">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline">{student.track}</Badge>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Last: {student.lastAttended}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="destructive"
                              className="whitespace-nowrap"
                            >
                              {student.attendance}% Attendance
                            </Badge>
                            <Button size="sm">Contact</Button>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-1">Detected Pattern</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {student.pattern}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                    <h3 className="mt-4 text-lg font-medium">No at-risk students found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery 
                        ? "Try adjusting your search criteria" 
                        : selectedTrack === "all" 
                          ? "No students currently flagged as at-risk" 
                          : `No at-risk students in the ${tracks.find(t => t.id === selectedTrack)?.name} track`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AttendanceInsights;
