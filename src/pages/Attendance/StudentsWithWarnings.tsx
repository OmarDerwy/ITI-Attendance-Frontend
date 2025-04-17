import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { AlertTriangle, Search, Filter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { axiosBackendInstance } from "@/api/config";
import { cn } from "@/lib/utils";

interface StudentWithWarning {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  track_name: string;
  warning_type: 'excused' | 'unexcused';
  unexcused_absences: number;
  excused_absences: number;
}

const StudentsWithWarnings = () => {
  const { userRole } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");

  // Fetch students with warnings
  const { data: students, isLoading, isError, error } = useQuery<StudentWithWarning[]>({
    queryKey: ["studentsWithWarnings"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("/attendance/students/with-warnings/");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  // Filter students by search query and track
  const filteredStudents = students?.filter(student => 
    (selectedTrack === "all" || student.track_name.toLowerCase() === selectedTrack.toLowerCase()) &&
    (student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     student.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  if (isError) {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-500">Error loading students</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTitle
        title="Students with Warnings"
        subtitle="Monitor students who have exceeded absence thresholds"
        icon={<AlertTriangle />}
      />

      <div className="space-y-6">
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
              onClick={() => setSelectedTrack("all")}
            >
              All Tracks
            </Button>
            {Array.from(new Set(students?.map(s => s.track_name) || [])).map(track => (
              <Button
                key={track}
                variant={selectedTrack === track ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTrack(track)}
              >
                {track}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-lg font-medium">Students with Warnings</h3>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
                <h3 className="mt-4 text-lg font-medium">Loading students...</h3>
              </div>
            ) : filteredStudents && filteredStudents.length > 0 ? (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{student.first_name} {student.last_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{student.track_name}</Badge>
                            <span>•</span>
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={student.warning_type === 'unexcused' ? "destructive" : "secondary"}
                          className={cn(
                            "whitespace-nowrap",
                            student.warning_type === 'excused' && "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          )}
                        >
                          {student.warning_type === 'unexcused' ? 'Unexcused Warning' : 'Excused Warning'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Unexcused Absences</h5>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {student.unexcused_absences}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Excused Absences</h5>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {student.excused_absences}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-lg font-medium">No students with warnings found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery 
                    ? "Try adjusting your search criteria" 
                    : selectedTrack === "all" 
                      ? "No students currently have warnings" 
                      : `No students with warnings in the ${selectedTrack} track`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StudentsWithWarnings; 