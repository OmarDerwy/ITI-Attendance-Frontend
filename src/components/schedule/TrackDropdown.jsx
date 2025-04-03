import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TrackDropdown = ({ tracks, selectedTrack, onTrackChange }) => {
  return (
    <Select value={selectedTrack} onValueChange={onTrackChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select track" />
      </SelectTrigger>
      <SelectContent>
        {tracks.map(track => (
          <SelectItem key={track.id} value={track.id}>
            {track.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TrackDropdown;
