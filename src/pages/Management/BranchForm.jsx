import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { axiosBackendInstance } from '@/api/config';

const BranchFormPage = () => {
  const { branchId } = useParams();
  const [branch, setBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    if (branchId && branchId !== "add") {
      const fetchBranchData = async () => {
        try {
          const response = await axiosBackendInstance.get(`/attendance/branches/${branchId}/`);
          setBranch(response.data);
        } catch (error) {
          toast({ title: "Branch not found", description: "The requested branch could not be found.", variant: "destructive" });
          navigate("/branches");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBranchData();
    } else {
      setIsLoading(false);
    }
  }, [branchId, userRole, navigate]);

  const handleSaveBranch = async (branchData) => {
    try {
      const endpoint = branchId && branchId !== "add" ? `/attendance/branches/${branchData.id}/` : "/attendance/branches/";
      const method = branchId && branchId !== "add" ? axiosBackendInstance.put : axiosBackendInstance.post;
      await method(endpoint, branchData);

      toast({
        title: branchId && branchId !== "add" ? "Branch Updated" : "Branch Added",
        description: `${branchData.name} has been ${branchId && branchId !== "add" ? "updated" : "added"} successfully.`
      });

      navigate("/branches");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue saving the branch data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 min-h-screen">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <BranchForm branch={branch} onSave={handleSaveBranch} isLoading={isLoading} />
        )}
      </div>
    </Layout>
  );
};

const BranchForm = ({ branch, onSave, isLoading }) => {
  const [name, setName] = useState(branch?.name || "");
  const [mapUrl, setMapUrl] = useState(branch?.mapUrl || "");
  const [latitude, setLatitude] = useState(branch?.latitude || "");
  const [longitude, setLongitude] = useState(branch?.longitude || "");
  const [radius, setRadius] = useState(branch?.radius || "");
  const [useCoordinates, setUseCoordinates] = useState(
    Boolean((branch?.latitude && branch?.longitude) || (!branch?.mapUrl))
  );

  const { toast } = useToast();
  const navigate = useNavigate();

  const extractLatLon = (url) => {
    const regex = /@([-\d.]+),([-\d.]+),/;
    const match = url.match(regex);

    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      };
    } else {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "Error", description: "Branch name is required", variant: "destructive" });
      return;
    }

    let finalLatitude = latitude;
    let finalLongitude = longitude;

    if (useCoordinates) {
      if (!latitude || !longitude) {
        toast({ title: "Error", description: "Both latitude and longitude are required", variant: "destructive" });
        return;
      }
    } else {
      if (!mapUrl.startsWith("http")) {
        toast({ title: "Error", description: "Please enter a valid URL starting with http:// or https://", variant: "destructive" });
        return;
      }

      const extractedCoordinates = extractLatLon(mapUrl);
      if (!extractedCoordinates) {
        toast({ title: "Error", description: "Unable to extract coordinates from the provided URL", variant: "destructive" });
        return;
      }

      finalLatitude = extractedCoordinates.latitude;
      finalLongitude = extractedCoordinates.longitude;
    }

    if (!radius || isNaN(radius) || radius <= 0) {
      toast({ title: "Error", description: "A valid radius is required", variant: "destructive" });
      return;
    }

    const branchData = {
      id: branch?.id || `branch-${Date.now()}`,
      name: name.trim(),
      radius: Number(radius),
      latitude: Number(finalLatitude),
      longitude: Number(finalLongitude),
      ...(useCoordinates ? {} : { mapUrl: mapUrl.trim() }),
    };

    onSave(branchData);
  };

  const handleCancel = () => {
    navigate('/branches');
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        title={branch ? "Edit Branch" : "Add New Branch"} 
        subtitle="Provide details about the branch location" 
        icon={<MapPin className="h-6 w-6" />}
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-1">
          <div className="grid gap-2">
            <Label htmlFor="name">Branch Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Campus" disabled={isLoading} />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Location Coordinates</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant={useCoordinates ? "default" : "outline"} size="sm" onClick={() => setUseCoordinates(true)} disabled={isLoading}>
                Manual Coordinates
              </Button>
              <Button type="button" variant={!useCoordinates ? "default" : "outline"} size="sm" onClick={() => setUseCoordinates(false)} disabled={isLoading}>
                Google Maps URL
              </Button>
            </div>
          </div>

          {useCoordinates ? (
            <div className="grid gap-4 mt-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="0.0001" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 40.7128" disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="0.0001" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. -74.0060" disabled={isLoading} />
              </div>
            </div>
          ) : (
            <div className="grid gap-2 mt-2">
              <Label htmlFor="mapUrl">Google Maps URL</Label>
              <Input id="mapUrl" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="e.g. https://maps.app.goo.gl/FdfDW4WTNcozbTdEA" disabled={isLoading} />
              <p className="text-sm text-muted-foreground">Paste a Google Maps link to the location</p>
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="radius">Radius (meters)</Label>
          <Input id="radius" type="number" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="e.g. 500" disabled={isLoading} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{branch ? "Update Branch" : "Add Branch"}</Button>
        </div>
      </form>
    </div>
  );
};

export default BranchFormPage;
