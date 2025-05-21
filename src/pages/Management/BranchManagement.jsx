import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, Building, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PageTitle from "@/components/ui/page-title";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { axiosBackendInstance } from "@/api/config";

const ITEMS_PER_PAGE = 6;

const BranchManagement = () => {
  const [allBranches, setAllBranches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchBranches();
  }, [userRole, navigate, toast]);

  // Apply frontend pagination whenever currentPage or filteredBranches change
  useEffect(() => {
    const filteredData = allBranches.filter((branch) =>
      branch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    setBranches(filteredData.slice(startIndex, endIndex));
  }, [allBranches, currentPage, searchTerm]);

  const fetchBranches = () => {
    setIsLoading(true);
    
    axiosBackendInstance
      .get("/attendance/branches/")
      .then((response) => {
        const data = response.data;
        setAllBranches(data);
        
        // Initialize with first page of data
        const startIndex = 0;
        const endIndex = ITEMS_PER_PAGE;
        setBranches(data.slice(startIndex, endIndex));
      })
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load branches",
          variant: "destructive",
        })
      )
      .finally(() => setIsLoading(false));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredBranches = allBranches.filter((branch) =>
    branch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDeleteBranch = () => {
    if (selectedBranch) {
      axiosBackendInstance
        .delete(`/attendance/branches/${selectedBranch.id}/`)
        .then(() => {
          const updatedBranches = allBranches.filter((branch) => branch.id !== selectedBranch.id);
          setAllBranches(updatedBranches);
          
          toast({
            title: "Branch deleted",
            description: `${selectedBranch.name} has been removed.`,
          });
        })
        .catch(() =>
          toast({
            title: "Error",
            description: "Failed to delete branch",
            variant: "destructive",
          })
        );
    }
    setIsDeleteDialogOpen(false);
    setSelectedBranch(null);
  };

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
      <div className="p-6 min-h-screen">
        <PageTitle
          title="Branch Management"
          subtitle="Manage your institution's branches and locations"
          icon={<Building className="h-6 w-6" />}
          action={
            <Button onClick={() => navigate("/branches/add")}>
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 mt-6">
          {/* Right Column - Branches Table */}
          <div className="md:col-span-2">
            <Card>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Latitude</TableHead>
                      <TableHead>Longitude</TableHead>
                      <TableHead>Radius</TableHead>
                      <TableHead>Branch Manager</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches?.length > 0 ? (
                      branches?.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium">
                            {branch.name}
                          </TableCell>
                          <TableCell>{branch.latitude || "Not provided"}</TableCell>
                          <TableCell>
                            {branch.longitude || "Not provided"}
                          </TableCell>
                          <TableCell>{branch.radius || "Not provided"}</TableCell>
                          <TableCell>{branch.branch_manager && branch.branch_manager.substring(0, branch.branch_manager.indexOf("(")) || "Not provided"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/branches/edit/${branch.id}`)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBranch(branch);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-muted-foreground"
                        >
                          {searchTerm
                            ? "No branches found matching your search."
                            : "No branches added yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
            
            {filteredBranches.length > ITEMS_PER_PAGE && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(Math.ceil(filteredBranches.length / ITEMS_PER_PAGE))].map((_, index) => (
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
                        onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filteredBranches.length / ITEMS_PER_PAGE)))}
                        className={currentPage === Math.ceil(filteredBranches.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the {selectedBranch?.name}{" "}
                branch? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBranch}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default BranchManagement;
