import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, MapPin } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageTitle from "@/components/ui/page-title";
import { axiosBackendInstance } from '@/api/config';

const ITEMS_PER_PAGE = 6;

const TrackManagement = () => {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({});
  const { userRole } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not an admin
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    // Fetch paginated tracks from backend
    fetchTracks(currentPage);
  }, [userRole, navigate, currentPage]);

  const fetchTracks = (page) => {
    setIsLoading(true);

    axiosBackendInstance
      .get(`/attendance/tracks/`, { params: { page } })
      .then((response) => {
        const data = response.data;
        setTracks(data.results);
        setPaginationMeta({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
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

  const handleDeleteClick = (track) => {
    setSelectedTrack(track);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTrack) {
      axiosBackendInstance
        .delete(`/attendance/tracks/${selectedTrack.id}/`)
        .then(() => {
          setTracks(tracks.filter(track => track.id !== selectedTrack.id));
          toast({
            title: "Track Deleted",
            description: "The track has been deleted successfully."
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to delete the track. Please try again later."
          });
        })
        .finally(() => {
          setIsDeleteDialogOpen(false);
          setSelectedTrack(null);
        });
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredTracks = tracks.filter((track) =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6 min-h-screen">
        <PageTitle
          title="Track Management"
          subtitle="Create, edit and manage your institution's tracks"
          icon={<MapPin className="h-6 w-6" />}
          action={<Button onClick={() => navigate("/tracks/add")}><Plus className="mr-2 h-4 w-4" /> Add Track</Button>}
        />
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>

          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Program Type</TableHead>
                  <TableHead>Intake</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTracks.length > 0 ? (
                  filteredTracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell className="font-medium">{track.name}</TableCell>
                      <TableCell>{track.program_type_display}</TableCell>
                      <TableCell>{track.intake || "N/A"}</TableCell>
                      <TableCell>{formatDate(track.start_date)}</TableCell>
                      <TableCell>{track.supervisor}</TableCell>
                      <TableCell>{track.default_branch || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/tracks/edit/${track.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(track)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "No tracks found matching your search." : "No tracks added yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {paginationMeta.count > ITEMS_PER_PAGE && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(paginationMeta.count / ITEMS_PER_PAGE))].map((_, index) => (
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
                    onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(paginationMeta.count / ITEMS_PER_PAGE)))}
                    className={currentPage === Math.ceil(paginationMeta.count / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedTrack?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default TrackManagement;
