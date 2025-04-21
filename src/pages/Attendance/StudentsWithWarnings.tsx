import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import {
  AlertTriangle,
  Search,
  Filter,
  LoaderCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { axiosBackendInstance } from "@/api/config";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentWithWarning {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  track_name: string;
  warning_type: "excused" | "unexcused";
  unexcused_absences: number;
  excused_absences: number;
}

const StudentsWithWarnings = () => {
  const { userRole } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [filteredData, setFilteredData] = useState<StudentWithWarning[]>([]);

  const { data: students = [], isLoading, isError, error } = useQuery({
    queryKey: ["studentsWithWarnings"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get(
        "/attendance/students/with-warnings/"
      );
      console.log("API Response:", response.data); // Debug
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchOnWindowFocus: false,
  });

  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const response = await axiosBackendInstance.get("/attendance/tracks/");
      console.log("Tracks data:", response.data);

      return response.data;
    },
  });

  useEffect(() => {
    if (Array.isArray(students)) {
      const filtered = students.filter((student: StudentWithWarning) =>
        (selectedTrack === "all" ||
          student.track_name?.toLowerCase() === selectedTrack.toLowerCase()) &&
        (student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]); 
    }
  }, [searchQuery, selectedTrack, students]);

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
          <h2 className="text-xl font-semibold mb-4 text-red-500">
            Error loading students
          </h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">

        <PageTitle
          title="Students with Warnings"
          subtitle="Monitor students who have exceeded absence thresholds"
          icon={<AlertTriangle />}
        />

        <div className="space-y-6">

          <Card className="p-6">
            <CardHeader className="py-4">
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
                  <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tracks</SelectItem>
                      {tracksData?.map((track) => (
                        <SelectItem key={track.id} value={track.name}>
                          {track.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>


                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading students...</p>
                </div>
              ) : filteredData && filteredData.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-muted/50">
                    <div className="col-span-4 font-medium text-sm">Student</div>
                    <div className="col-span-2 font-medium text-sm">Track</div>
                    <div className="col-span-2 font-medium text-sm">Warning Type</div>
                    <div className="col-span-2 font-medium text-sm">Unexcused</div>
                    <div className="col-span-2 font-medium text-sm">Excused</div>
                  </div>
                  <div className="divide-y">
                    {filteredData.map((student) => (
                      <div
                        key={student.id}
                        className="grid grid-cols-12 gap-4 py-3 px-4 items-center hover:bg-muted/50 transition-colors"
                      >
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="outline" className="font-normal">
                            {student.track_name}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <Badge
                            variant={student.warning_type === "unexcused" ? "destructive" : "secondary"}
                            className="font-normal"
                          >
                            {student.warning_type === "unexcused" ? "Unexcused" : "Excused"}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <Badge
                            variant="outline"
                            className="font-normal bg-red-50 text-red-700 border-red-200"
                          >
                            {student.unexcused_absences}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <Badge
                            variant="outline"
                            className="font-normal bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {student.excused_absences}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
      </div>
    </Layout>
  );
};

export default StudentsWithWarnings;