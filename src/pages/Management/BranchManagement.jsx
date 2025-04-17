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
import PageTitle from "@/components/ui/page-title";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { axiosBackendInstance } from "@/api/config";

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

    axiosBackendInstance
      .get("/attendance/branches/")
      .then((response) => setBranches(response.data))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load branches",
          variant: "destructive",
        })
      )
      .finally(() => setIsLoading(false));
  }, [userRole, navigate, toast]);

  const filteredBranches = branches?.filter((branch) =>
    branch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBranch = () => {
    if (selectedBranch) {
      axiosBackendInstance
        .delete(`/attendance/branches/${selectedBranch.id}/`)
        .then(() => {
          setBranches(
            branches.filter((branch) => branch.id !== selectedBranch.id)
          );
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Search, Logo and Description */}
          <div className="md:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branch Logo & Info */}
            <Card className="overflow-hidden">
              {/* <div className="bg-primary/10 p-6 flex justify-center">
                <Building className="h-16 w-16 text-primary" />
              </div> */}
              <CardHeader>
                <CardTitle>Location-Based Attendance</CardTitle>
                <CardDescription>How geofence system works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* Map Radius Simulation */}
                <div className="mb-6">
                  <div className="w-full h-44 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden mb-2">
                    {/* Map styling */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="grid grid-cols-8 h-full w-full">
                        {Array(64).fill().map((_, i) => (
                          <div key={i} className="border border-slate-300 dark:border-slate-600"></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Roads */}
                    <div className="absolute inset-0">
                      <div className="w-full h-[2px] bg-slate-300 dark:bg-slate-600 absolute top-1/3"></div>
                      <div className="h-full w-[2px] bg-slate-300 dark:bg-slate-600 absolute left-2/3"></div>
                      <div className="w-2/3 h-[1px] bg-slate-300 dark:bg-slate-600 absolute bottom-1/4 left-0"></div>
                    </div>
                    
                    {/* Location point and radius */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {/* Radius circle */}
                      <div className="w-32 h-32 rounded-full border-2 border-primary/30 bg-primary/10 animate-pulse"></div>
                      
                      {/* Branch point - Building icon without circle */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      
                      {/* User inside radius (allowed) */}
                      <div className="w-3 h-3 bg-green-500 rounded-full absolute left-[60%] top-[30%] shadow-sm z-20">
                        <div className="w-full h-full rounded-full bg-green-500/50 animate-ping absolute"></div>
                      </div>
                      
                      {/* User outside radius (not allowed) */}
                      <div className="w-3 h-3 bg-red-500 rounded-full absolute left-[95%] top-[70%] shadow-sm z-20">
                        <div className="w-full h-full rounded-full bg-red-500/50 animate-ping absolute"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Visualization of a branch (building icon) with its attendance radius. 
                    Green dot: user within radius (attendance allowed). 
                    Red dot: user outside radius (attendance denied).
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <p><span className="font-medium">Latitude & Longitude</span>: These coordinates define the exact geographic location of each branch.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-primary mt-1 shrink-0" />
                  <p><span className="font-medium">Radius</span>: Defines the acceptable distance (in meters) from the branch center where attendance can be registered.</p>
                </div>
                <p className="text-muted-foreground mt-2">
                  When users attempt to register attendance, our system compares their current GPS location with the branch coordinates and determines if they're within the specified radius.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Branches Table */}
          <div className="md:col-span-2">
            <Card>
              <div className="rounded-lg overflow-hidden">
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
                    {filteredBranches?.length > 0 ? (
                      filteredBranches?.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium">
                            {branch.name}
                          </TableCell>
                          <TableCell>{branch.latitude || "Not provided"}</TableCell>
                          <TableCell>
                            {branch.longitude || "Not provided"}
                          </TableCell>
                          <TableCell>{branch.radius || "Not provided"}</TableCell>
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
