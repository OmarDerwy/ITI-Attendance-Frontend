
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import branches from "@/data/branches.json";
import supervisors from "@/data/supervisors.json";

interface Track {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  supervisor?: string;
  startDate?: Date;
  endDate?: Date;
  trackType?: "9-month" | "4-month";
  intake?: string;
  branchId?: string;
}

interface TrackFormProps {
  track: Track | null;
  onSave: (trackData: Track) => void;
  onCancel: () => void;
}

const TrackForm = ({ track, onSave, onCancel }: TrackFormProps) => {
  const [name, setName] = useState(track?.name || "");
  const [description, setDescription] = useState(track?.description || "");
  const [location, setLocation] = useState(track?.location || "");
  const [latitude, setLatitude] = useState<number | string>(track?.latitude || "");
  const [longitude, setLongitude] = useState<number | string>(track?.longitude || "");
  const [supervisor, setSupervisor] = useState(track?.supervisor || "");
  const [startDate, setStartDate] = useState<Date | undefined>(track?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(track?.endDate);
  const [trackType, setTrackType] = useState<"9-month" | "4-month">(track?.trackType || "9-month");
  const [intake, setIntake] = useState(track?.intake || "");
  const [branchId, setBranchId] = useState(track?.branchId || "");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSupervisors = searchTerm
    ? supervisors.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : supervisors;

  const handleSubmit = () => {
    // Basic validation
    if (!name || !location) {
      return;
    }

    // Prepare track data
    const trackData: Track = {
      id: track ? track.id : `track-${Date.now()}`,
      name,
      location,
      description,
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      supervisor,
      startDate,
      endDate,
      trackType,
      intake,
      branchId
    };

    onSave(trackData);
  };

  return (
    <div className="grid gap-4 py-4">
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
        <Label htmlFor="intake">Intake</Label>
        <Input
          id="intake"
          value={intake}
          onChange={(e) => setIntake(e.target.value)}
          placeholder="e.g. 43-44"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the track"
        />
      </div>

      <div className="grid gap-2">
        <Label>Track Type</Label>
        <RadioGroup 
          value={trackType}
          onValueChange={(value) => setTrackType(value as "9-month" | "4-month")}
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

      <div className="grid grid-cols-2 gap-4">
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
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      setSearchTerm("");
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
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Location (Room/Area)</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Building A, Floor 2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g. 40.7128"
            step="0.0001"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g. -74.0060"
            step="0.0001"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};

export default TrackForm;
