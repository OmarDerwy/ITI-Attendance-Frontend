import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, Building } from "lucide-react";
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
import PageTitle from "@/components/ui/page-title";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import axiosInstance from "../../apis/config";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    axiosInstance.get("/attendance/branches/")
      .then(response => setBranches(response.data.results))
      .catch(() => toast({ title: "Error", description: "Failed to load branches", variant: "destructive" }))
      .finally(() => setIsLoading(false));
  }, [userRole, navigate, toast]);

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBranch = () => {
    if (selectedBranch) {
      axiosInstance.delete(`/attendance/branches/${selectedBranch.id}/`)
        .then(() => {
          setBranches(branches.filter(branch => branch.id !== selectedBranch.id));
          toast({ title: "Branch deleted", description: `${selectedBranch.name} has been removed.` });
        })
        .catch(() => toast({ title: "Error", description: "Failed to delete branch", variant: "destructive" }));
    }
    setIsDeleteDialogOpen(false);
    setSelectedBranch(null);
  };

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
          title="Branch Management" 
          subtitle="Manage your institution's branches and locations"
          icon={<Building className="h-6 w-6" />}
          action={<Button onClick={() => navigate("/branches/add")}><Plus className="mr-2 h-4 w-4" /> Add Branch</Button>}
        />

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search branches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full" />
            </div>
          </div>

          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.latitude || "Not provided"}</TableCell>
                      <TableCell>{branch.longitude || "Not provided"}</TableCell>
                      <TableCell>{branch.radius || "Not provided"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/branches/edit/${branch.id}`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedBranch(branch); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "No branches found matching your search." : "No branches added yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the {selectedBranch?.name} branch? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBranch}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default BranchManagement;
