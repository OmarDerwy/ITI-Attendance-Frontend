import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import PageTitle from "../../components/ui/page-title";
import { axiosBackendInstance } from '@/api/config';

const TrackFormPage = () => {
  const { trackId } = useParams();
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [startDate, setStartDate] = useState();
  const [trackType, setTrackType] = useState("nine_months");
  const [intake, setIntake] = useState("");
  const [branchId, setBranchId] = useState("");
  const [supervisorSearchTerm, setSupervisorSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");

  // Dynamic data
  const [supervisors, setSupervisors] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (userRole !== "admin") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [branchesRes, supervisorsRes] = await Promise.all([
          axiosBackendInstance.get("/attendance/branches/"),
          axiosBackendInstance.get("/accounts/users/supervisors/"),
        ]);

        const formattedBranches = branchesRes.data.results.map((b) => ({
          branch_id: b.id, // Use branch_id instead of id
          name: b.name,
        }));

        const formattedSupervisors = supervisorsRes.data.map((s) => ({
          supervisor_id: s.id, // Use supervisor_id instead of id
          name:
            s.first_name && s.last_name
              ? `${s.first_name} ${s.last_name}`
              : s.email,
        }));

        setBranches(formattedBranches);
        setSupervisors(formattedSupervisors);

        if (trackId && trackId !== "add") {
          const trackRes = await axiosBackendInstance.get(`/attendance/tracks/${trackId}/`);
          const trackData = trackRes.data;
          setName(trackData.name || "");
          setDescription(trackData.description || "");
          setSupervisor(trackData.supervisor_id || "");
          setStartDate(
            trackData.start_date ? new Date(trackData.start_date) : undefined
          );
          setTrackType(trackData.program_type || "nine_months");
          setIntake(trackData.intake || "");
          setBranchId(trackData.branch_id || "");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [trackId, userRole, navigate, toast]);

  const filteredSupervisors = useMemo(() => {
    return supervisorSearchTerm
      ? supervisors.filter(
          (s) =>
            (s.name && s.name.toLowerCase().includes(supervisorSearchTerm.toLowerCase())) ||
            (s.email && s.email.toLowerCase().includes(supervisorSearchTerm.toLowerCase()))
        )
      : supervisors;
  }, [supervisorSearchTerm, supervisors]);

  const filteredBranches = useMemo(() => {
    return branchSearchTerm
      ? branches.filter((b) =>
          b.name.toLowerCase().includes(branchSearchTerm.toLowerCase())
        )
      : branches;
  }, [branchSearchTerm, branches]);

  const handleSupervisorSelect = (id) => {
    console.log("Selected Supervisor ID:", id); // Debugging log
    setSupervisor(id);
    setSupervisorSearchTerm("");
  };

  const handleBranchSelect = (id) => {
    console.log("Selected Branch ID:", id); // Debugging log
    setBranchId(id);
    setBranchSearchTerm("");
  };

  const handleSubmit = async () => {
    if (!name || !intake || !supervisor || !branchId || !startDate) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }

    const trackData = {
      name,
      description,
      supervisor_id: supervisor, // Use supervisor_id
      start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
      program_type: trackType,
      intake,
      branch_id: branchId, // Use branch_id
      ...(trackId && trackId !== "add" && { track_id: trackId }), // Include trackId in edit mode
    };

    try {
      if (trackId && trackId !== "add") {
        console.log("Payload for PUT request:", trackData); // Log payload
        await axiosBackendInstance.put(`/attendance/tracks/${trackId}/`, trackData);
        toast({
          title: "Track Updated",
          description: `${trackData.name} has been updated successfully.`,
        });
      } else {
        console.log("Track Data:", trackData);

        await axiosBackendInstance.post("/attendance/tracks/", trackData);
        toast({
          title: "Track Added",
          description: `${trackData.name} has been added successfully.`,
        });
      }
      navigate("/tracks");
    } catch (error) {
      console.error("Error saving track:", error);
      toast({
        title: "Error",
        description: "Failed to save track. Please try again later.",
        variant: "destructive",
      });
    }
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
        <div className="space-y-6">
          <PageTitle
            title={
              trackId && trackId !== "add" ? "Edit Track" : "Add New Track"
            }
            subtitle="Provide details about the branch location"
            icon={<MapPin className="h-6 w-6" />}
          />

          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Track Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Web Development"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="intake">Intake Number</Label>
                    <Input
                      id="intake"
                      type="number"
                      value={intake}
                      onChange={(e) => setIntake(e.target.value)}
                      placeholder="e.g. 43"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the track"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Track Type</Label>
                  <RadioGroup
                    value={trackType}
                    onValueChange={(value) => setTrackType(value)}
                    className="flex items-center space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nine_months" id="nine_months" />
                      <Label htmlFor="nine_months" className="cursor-pointer">
                        9-Month Track
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intensive" id="intensive" />
                      <Label htmlFor="intensive" className="cursor-pointer">
                        Intensive Program
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {supervisors.find((s) => s.supervisor_id === supervisor)?.name || "Select supervisor"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search supervisors..."
                          className="border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
                          value={supervisorSearchTerm}
                          onChange={(e) => setSupervisorSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredSupervisors.length > 0 ? (
                          filteredSupervisors.map((s) => (
                            <Button
                              key={s.supervisor_id}
                              variant={s.supervisor_id === supervisor ? "default" : "ghost"}
                              className={`w-full justify-start font-normal ${
                                s.supervisor_id === supervisor ? "bg-primary text-white" : ""
                              }`}
                              onClick={() => handleSupervisorSelect(s.supervisor_id)}
                            >
                              {s.name}
                            </Button>
                          ))
                        ) : (
                          <p className="p-3 text-muted-foreground">No supervisors found.</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {branches.find((b) => b.branch_id === branchId)?.name || "Select branch"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search branches..."
                          className="border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
                          value={branchSearchTerm}
                          onChange={(e) => setBranchSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredBranches.length > 0 ? (
                          filteredBranches.map((b) => (
                            <Button
                              key={b.branch_id}
                              variant={b.branch_id === branchId ? "default" : "ghost"}
                              className={`w-full justify-start font-normal ${
                                b.branch_id === branchId ? "bg-primary text-white" : ""
                              }`}
                              onClick={() => handleBranchSelect(b.branch_id)}
                            >
                              {b.name}
                            </Button>
                          ))
                        ) : (
                          <p className="p-3 text-muted-foreground">No branches found.</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => navigate("/tracks")}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Save Track</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TrackFormPage;
