
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Edit, Trash2, CalendarRange, UserCircle, Building, School } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import TrackForm from "@/components/tracks/TrackForm";

// Import supervisors and branches
import supervisors from "@/data/supervisors.json";
import branches from "@/data/branches.json";

interface Track {
  id: string;
  name: string;
  location: string;
  description: string;
  latitude: number;
  longitude: number;
  supervisor?: string;
  startDate?: Date;
  endDate?: Date;
  trackType?: "9-month" | "4-month";
  intake?: string;
  branchId?: string;
}

const mockTracks: Track[] = [
  {
    id: "1",
    name: "Web Development",
    location: "Building A, Floor 2",
    description: "Modern web development using React, Node.js and other technologies",
    latitude: 40.7128,
    longitude: -74.0060,
    supervisor: "1",
    startDate: new Date(2023, 8, 1),
    endDate: new Date(2024, 4, 30),
    trackType: "9-month",
    intake: "43-44",
    branchId: "1"
  },
  {
    id: "2",
    name: "Mobile Development",
    location: "Building B, Floor 1",
    description: "Mobile app development for iOS and Android",
    latitude: 40.7138,
    longitude: -74.0070,
    supervisor: "2",
    startDate: new Date(2023, 8, 15),
    endDate: new Date(2023, 12, 15),
    trackType: "4-month",
    intake: "42-43",
    branchId: "2"
  },
  {
    id: "3",
    name: "Data Science",
    location: "Building C, Floor 3",
    description: "Data analysis, machine learning and AI",
    latitude: 40.7148,
    longitude: -74.0080,
    supervisor: "3",
    startDate: new Date(2023, 9, 1),
    endDate: new Date(2024, 5, 30),
    trackType: "9-month",
    intake: "43-44",
    branchId: "3"
  }
];

const TrackManagement = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const { userRole } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin, redirect otherwise
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    // Fetch tracks (mock data for now)
    setTracks(mockTracks);
    setIsLoading(false);
  }, [userRole, navigate]);

  const handleOpenDialog = (track?: Track) => {
    if (track) {
      setCurrentTrack(track);
    } else {
      setCurrentTrack(null);
    }
    setIsDialogOpen(true);
  };

  const handleSaveTrack = (trackData: Track) => {
    if (currentTrack) {
      // Update existing track
      setTracks(tracks.map(t => (t.id === currentTrack.id ? trackData : t)));
      toast({
        title: "Track Updated",
        description: `${trackData.name} track has been updated successfully.`
      });
    } else {
      // Add new track
      setTracks([...tracks, trackData]);
      toast({
        title: "Track Added",
        description: `${trackData.name} track has been added successfully.`
      });
    }

    // Close dialog
    setIsDialogOpen(false);
  };

  const handleDeleteTrack = (trackId: string) => {
    // Filter out the deleted track
    setTracks(tracks.filter(track => track.id !== trackId));
    toast({
      title: "Track Deleted",
      description: "The track has been deleted successfully."
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Not set";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
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
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Track Management</h1>
            <p className="text-muted-foreground">
              Create, edit and manage your institution's tracks
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Track
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {currentTrack ? "Edit Track" : "Add New Track"}
                </DialogTitle>
              </DialogHeader>
              <TrackForm 
                track={currentTrack}
                onSave={handleSaveTrack}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Card key={track.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-primary" />
                    {track.name}
                  </CardTitle>
                  {track.intake && (
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Intake {track.intake}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{track.description}</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CalendarRange className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">Duration</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(track.startDate)} - {formatDate(track.endDate)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {track.trackType === "9-month" ? "9-Month Track" : "Intensive (4-Month)"}
                      </p>
                    </div>
                  </div>
                  
                  {track.supervisor && (
                    <div className="flex items-start gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">Supervisor</h3>
                        <p className="text-sm text-muted-foreground">
                          {supervisors.find(s => s.id === track.supervisor)?.name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {track.branchId && (
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">Branch</h3>
                        <p className="text-sm text-muted-foreground">
                          {branches.find(b => b.id === track.branchId)?.name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">Location</h3>
                      <p className="text-sm text-muted-foreground">{track.location}</p>
                      {(track.latitude !== 0 || track.longitude !== 0) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {track.latitude}, {track.longitude}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 px-6 py-3">
                <div className="flex justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(track)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrack(track.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {tracks.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">No tracks added yet. Click "Add Track" to create your first track.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackManagement;
