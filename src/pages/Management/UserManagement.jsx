import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, User, Loader2 } from "lucide-react";
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

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if user is not an admin
    // if (userRole !== "admin") {
    //   toast({
    //     title: "Access Denied",
    //     description: "You do not have permission to access this page.",
    //     variant: "destructive",
    //   });
    //   navigate("/");
    //   return;
    // }

    // Fetch all users from backend
    fetchUsers();
  }, [userRole, navigate]);

  // Apply filtering and pagination whenever dependent values change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [allUsers, currentPage, searchTerm, userTypeFilter]);

  const applyFiltersAndPagination = () => {
    // Apply all filters
    const filtered = allUsers.filter((user) => {
      // Apply text search filter
      const matchesSearch = `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // Apply user type filter
      const matchesType = 
        userTypeFilter === "all" || 
        user.groups[0].toLowerCase() === userTypeFilter.toLowerCase();
      
      return matchesSearch && matchesType;
    });
    
    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedUsers(filtered.slice(startIndex, endIndex));
  };

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, userTypeFilter]);

  const fetchUsers = () => {
    setIsLoading(true);

    axiosBackendInstance
      .get(`/accounts/users/admins-and-supervisors`)
      .then((response) => {
        const data = response.data;
        console.log("Fetched users:", data);
        setAllUsers(data.results || data); // Handle both formats
        applyFiltersAndPagination();
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      axiosBackendInstance
        .delete(`/accounts/users/${selectedUser.id}/`)
        .then(() => {
          const updatedUsers = allUsers.filter(user => user.id !== selectedUser.id);
          setAllUsers(updatedUsers);
          
          toast({
            title: "User Deleted",
            description: "The user has been deleted successfully."
          });
          applyFiltersAndPagination();
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          toast({
            title: "Error",
            description: "Failed to delete the user. Please try again later."
          });
        })
        .finally(() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        });
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get filtered users for pagination calculation
  const filteredUsers = allUsers.filter((user) => {
    // Apply text search filter
    const matchesSearch = `${user.first_name} ${user.last_name} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    // Apply user type filter
    const matchesType = 
      userTypeFilter === "all" || 
      user.groups[0].toLowerCase() === userTypeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
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
          title="User Management"
          subtitle="Create, edit and manage system users (supervisors and admins)."
          icon={<User className="h-6 w-6" />}
          action={<Button onClick={() => navigate("/users/add")}><Plus className="mr-2 h-4 w-4" /> Add User</Button>}
        />
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            
            {/* User type filter buttons */}
            <div className="flex gap-2">
              <Button 
                variant={userTypeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setUserTypeFilter("all")}
              >
                All
              </Button>
              <Button 
                variant={userTypeFilter === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setUserTypeFilter("admin")}
              >
                Admin
              </Button>
              <Button 
                variant={userTypeFilter === "supervisor" ? "default" : "outline"}
                size="sm"
                onClick={() => setUserTypeFilter("supervisor")}
              >
                Supervisor
              </Button>
            </div>
          </div>

          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.groups[0]}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/users/edit/${user.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
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
                      {searchTerm ? "No users found matching your search." : "No users added yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredUsers.length > ITEMS_PER_PAGE && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))].map((_, index) => (
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
                    onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)))}
                    className={currentPage === Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
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
                Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}? This action cannot be undone.
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

export default UserManagement;
