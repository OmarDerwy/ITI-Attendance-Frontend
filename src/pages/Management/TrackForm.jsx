import { useState, useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import PageTitle from '../../components/ui/page-title';
import axiosInstance from "../../apis/config";

const mockTracks = [
  {
    id: "1",
    name: "Web Development",
    description: "Modern web development using React, Node.js and other technologies",
    supervisor: "1",
    startDate: new Date(2023, 8, 1),
    trackType: "9-month",
    intake: "43",
    branchId: "1"
  },
  {
    id: "2",
    name: "Mobile Development",
    description: "Mobile app development for iOS and Android",
    supervisor: "2",
    startDate: new Date(2023, 8, 15),
    trackType: "4-month",
    intake: "42",
    branchId: "2"
  },
  {
    id: "3",
    name: "Data Science",
    description: "Data analysis, machine learning and AI",
    supervisor: "3",
    startDate: new Date(2023, 9, 1),
    trackType: "9-month",
    intake: "43",
    branchId: "3"
  }
];

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
  const [trackType, setTrackType] = useState("9-month");
  const [intake, setIntake] = useState("");
  const [branchId, setBranchId] = useState("");
  const [supervisorSearchTerm, setSupervisorSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");

  // Dynamic data
  const [supervisors, setSupervisors] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supervisorsRes, branchesRes] = await Promise.all([
          axiosInstance.get("/attendance/branches/"),
          axiosInstance.get("/attendance/supervisors/"),
        ]);
        setSupervisors(supervisorsRes.data);
        setBranches(branchesRes.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch supervisors or branches.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    // Check if user is admin, redirect otherwise
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    // If editing, load track data
    if (trackId && trackId !== "add") {
      const trackData = mockTracks.find(t => t.id === trackId);
      if (!trackData) {
        toast({
          title: "Track not found",
          description: "The requested track could not be found.",
          variant: "destructive",
        });
        navigate("/tracks");
      } else {
        setName(trackData.name || "");
        setDescription(trackData.description || "");
        setSupervisor(trackData.supervisor || "");
        setStartDate(trackData.startDate ? new Date(trackData.startDate) : undefined);
        setTrackType(trackData.trackType || "9-month");
        setIntake(trackData.intake || "");
        setBranchId(trackData.branchId || "");
      }
    }
    
    setIsLoading(false);
  }, [trackId, userRole, navigate, toast]);

  const filteredSupervisors = supervisorSearchTerm
    ? supervisors.filter(s => 
        s.name.toLowerCase().includes(supervisorSearchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(supervisorSearchTerm.toLowerCase())
      )
    : supervisors;
    
  const filteredBranches = branchSearchTerm
    ? branches.filter(b => b.name.toLowerCase().includes(branchSearchTerm.toLowerCase()))
    : branches;

  const handleSubmit = () => {
    // Basic validation
    if (!name) {
      toast({
        title: "Validation Error",
        description: "Track name is required",
        variant: "destructive",
      });
      return;
    }

    // Prepare track data
    const trackData = {
      id: trackId && trackId !== "add" ? trackId : `track-${Date.now()}`,
      name,
      description,
      supervisor,
      startDate,
      trackType,
      intake,
      branchId
    };

    // In a real app, would save to API/database
    toast({
      title: trackId && trackId !== "add" ? "Track Updated" : "Track Added",
      description: `${trackData.name} has been ${trackId && trackId !== "add" ? "updated" : "added"} successfully.`
    });
    
    navigate("/tracks");
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
    title= {trackId && trackId !== "add" ? "Edit Track" : "Add New Track"} 
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
                      <RadioGroupItem value="9-month" id="nine-month" />
                      <Label htmlFor="nine-month" className="cursor-pointer">9-Month Track</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4-month" id="four-month" />
                      <Label htmlFor="four-month" className="cursor-pointer">Intensive (4-Month)</Label>
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
                        {supervisor
                          ? supervisors.find((s) => s.id === supervisor)?.name || "Select supervisor"
                          : "Select supervisor"}
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
                              key={s.id}
                              variant="ghost"
                              className="w-full justify-start font-normal"
                              onClick={() => {
                                setSupervisor(s.id);
                                setSupervisorSearchTerm("");
                              }}
                            >
                              <div className="flex flex-col items-start">
                                <span>{s.name}</span>
                                <span className="text-xs text-muted-foreground">{s.email}</span>
                              </div>
                            </Button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No supervisors found.
                          </div>
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
                        {branchId
                          ? branches.find((b) => b.id === branchId)?.name || "Select branch"
                          : "Select branch"}
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
                              key={b.id}
                              variant="ghost"
                              className="w-full justify-start font-normal"
                              onClick={() => {
                                setBranchId(b.id);
                                setBranchSearchTerm("");
                              }}
                            >
                              <span>{b.name}</span>
                            </Button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No branches found.
                          </div>
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