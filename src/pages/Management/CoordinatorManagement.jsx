import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const CoordinatorManagement = () => {
  const [allCoordinators, setAllCoordinators] = useState([]);
  const [displayedCoordinators, setDisplayedCoordinators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    //Redirect if user is not an admin
    // if (userRole !== "branch-manager") {
    //   toast({
    //     title: "Access Denied",
    //     description: "You do not have permission to access this page.",
    //     variant: "destructive",
    //   });
    //   navigate("/");
    //   return;
    // }

    // Fetch all coordinators from backend
    fetchCoordinators();
  }, [userRole, navigate]);

  // Apply filtering and pagination whenever dependent values change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [allCoordinators, currentPage, searchTerm]);

  const applyFiltersAndPagination = () => {
    // Apply text search filter
    const filtered = allCoordinators.filter((coordinator) => {
      const matchesSearch = `${coordinator.first_name} ${coordinator.last_name} ${coordinator.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
    
    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedCoordinators(filtered.slice(startIndex, endIndex));
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCoordinators = () => {
    setIsLoading(true);

    axiosBackendInstance
      .get(`/accounts/coordinators`)
      .then((response) => {
        const data = response.data;
        console.log("Fetched coordinators:", data);
        setAllCoordinators(data.results || data); // Handle both formats
        applyFiltersAndPagination();
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching coordinators:", error);
        toast({
          title: "Error",
          description: "Failed to load coordinators. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  };

  const handleDeleteClick = (coordinator) => {
    setSelectedCoordinator(coordinator);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCoordinator) {
      axiosBackendInstance
        .delete(`/accounts/coordinators/${selectedCoordinator.id}/`)
        .then(() => {
          const updatedCoordinators = allCoordinators.filter(coordinator => coordinator.id !== selectedCoordinator.id);
          setAllCoordinators(updatedCoordinators);
          
          toast({
            title: "Coordinator Deleted",
            description: "The coordinator has been deleted successfully."
          });
          applyFiltersAndPagination();
        })
        .catch((error) => {
          console.error("Error deleting coordinator:", error);
          toast({
            title: "Error",
            description: "Failed to delete the coordinator. Please try again later."
          });
        })
        .finally(() => {
          setIsDeleteDialogOpen(false);
          setSelectedCoordinator(null);
        });
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get filtered coordinators for pagination calculation
  const filteredCoordinators = allCoordinators.filter((coordinator) => {
    return `${coordinator.first_name} ${coordinator.last_name} ${coordinator.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
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
          title="Coordinator Management"
          subtitle="Create, edit and manage system coordinators."
          icon={<Users className="h-6 w-6" />}
          action={<Button onClick={() => navigate("/coordinators/add")}><Plus className="mr-2 h-4 w-4" /> Add Coordinator</Button>}
        />
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coordinators..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCoordinators.length > 0 ? (
                  displayedCoordinators.map((coordinator) => (
                    <TableRow key={coordinator.id}>
                      <TableCell className="font-medium">
                        {coordinator.first_name} {coordinator.last_name}
                      </TableCell>
                      <TableCell>{coordinator.email}</TableCell>
                      <TableCell>{coordinator.phone_number || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/coordinators/edit/${coordinator.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(coordinator)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "No coordinators found matching your search." : "No coordinators added yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredCoordinators.length > ITEMS_PER_PAGE && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(filteredCoordinators.length / ITEMS_PER_PAGE))].map((_, index) => (
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
                    onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filteredCoordinators.length / ITEMS_PER_PAGE)))}
                    className={currentPage === Math.ceil(filteredCoordinators.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
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
                Are you sure you want to delete {selectedCoordinator?.first_name} {selectedCoordinator?.last_name}? This action cannot be undone.
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

export default CoordinatorManagement;