
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Loader2, Search, BookOpen, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PageTitle from "@/components/ui/page-title";
import { axiosBackendInstance } from "@/api/config";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 6;

const TracksView = () => {
  const [allTracks, setAllTracks] = useState([]);
  const [displayedTracks, setDisplayedTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIntake, setSearchIntake] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [programTypeFilter, setProgramTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole } = useUser();
  const navigate = useNavigate();

  // Format date function
  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  useEffect(() => {
    if (!["branch-manager", "coordinator", "admin"].includes(userRole)){
      navigate("/");
      return;
    }

    // Fetch all tracks from backend
    fetchTracks();
  }, [userRole, navigate]);

  // Apply filtering and pagination whenever dependent values change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [allTracks, currentPage, searchTerm, searchIntake, searchStartDate, programTypeFilter]);
  
  const applyFiltersAndPagination = () => {
    // Apply all filters
    const filtered = allTracks.filter((track) => {
      const nameMatch = track?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) || !searchTerm;
      
      const typeButtonMatch = programTypeFilter === "all" || 
        track?.program_type === programTypeFilter;
        
      const intakeMatch = !searchIntake || 
        (track?.intake?.toString().includes(searchIntake));
      
      const startDateMatch = !searchStartDate || 
        (track?.start_date && new Date(track.start_date) >= new Date(searchStartDate));
      
      return nameMatch && typeButtonMatch && intakeMatch && startDateMatch;
    });
    
    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedTracks(filtered.slice(startIndex, endIndex));
  };

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchIntake, searchStartDate, programTypeFilter]);

  const fetchTracks = () => {
    setIsLoading(true);

    axiosBackendInstance
      .get(`/attendance/tracks/`)
      .then((response) => {
        const data = response.data;
        setAllTracks(data);
        applyFiltersAndPagination();
        setIsLoading(false);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load tracks. Please try again later.",
        });
        setIsLoading(false);
      });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get filtered tracks for pagination calculation
  const filteredTracks = allTracks.filter((track) => {
    const nameMatch = track?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) || !searchTerm;
    
    const typeButtonMatch = programTypeFilter === "all" || 
      track?.program_type === programTypeFilter;
      
    const intakeMatch = !searchIntake || 
      (track?.intake?.toString().includes(searchIntake));
    
    const startDateMatch = !searchStartDate || 
      (track?.start_date && new Date(track.start_date) >= new Date(searchStartDate));
    
    return nameMatch && typeButtonMatch && intakeMatch && startDateMatch;
  });

  if (isLoading) {
    return (
      <Layout>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6 min-h-screen">
        <PageTitle
          title="Tracks"
          subtitle="View all tracks in your institution"
          icon={<BookOpen className="h-6 w-6" />}
        />
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="flex flex-wrap items-center justify-between p-4 border-b gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-auto min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search track names..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter by intake..."
                      value={searchIntake}
                      onChange={(e) => setSearchIntake(e.target.value)}
                      className="pl-8 w-full max-w-[180px]"
                    />
                  </div>
                  
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      placeholder="Start date from..."
                      value={searchStartDate}
                      onChange={(e) => setSearchStartDate(e.target.value)}
                      className="pl-8 w-full max-w-[180px]"
                    />
                  </div>
                </div>
                
                {/* Program type filter buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant={programTypeFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProgramTypeFilter("all")}
                  >
                    All Types
                  </Button>
                  <Button 
                    variant={programTypeFilter === "nine_months" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProgramTypeFilter("nine_months")}
                  >
                    9 Months
                  </Button>
                  <Button 
                    variant={programTypeFilter === "intensive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProgramTypeFilter("intensive")}
                  >
                    Intensive
                  </Button>
                </div>
              </div>
              
              <div className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Program Type</TableHead>
                      <TableHead>Intake</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Supervisor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedTracks.length > 0 ? (
                      displayedTracks.map((track) => (
                        <TableRow key={track.id}>
                          <TableCell className="font-medium">
                            {track.name}
                          </TableCell>
                          <TableCell>{track.program_type_display}</TableCell>
                          <TableCell>{track.intake || "N/A"}</TableCell>
                          <TableCell>{formatDate(track.start_date)}</TableCell>
                          <TableCell>{track.supervisor}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-muted-foreground"
                        >
                          {searchTerm || searchIntake || programTypeFilter !== "all"
                            ? "No tracks found matching your filters."
                            : "No tracks available."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {filteredTracks.length > ITEMS_PER_PAGE && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {[
                      ...Array(Math.ceil(filteredTracks.length / ITEMS_PER_PAGE)),
                    ].map((_, index) => (
                      <PaginationItem key={index + 1}>
                        <PaginationLink
                          isActive={currentPage === index + 1}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(
                              currentPage + 1,
                              Math.ceil(filteredTracks.length / ITEMS_PER_PAGE)
                            )
                          )
                        }
                        className={
                          currentPage ===
                          Math.ceil(filteredTracks.length / ITEMS_PER_PAGE)
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TracksView;
