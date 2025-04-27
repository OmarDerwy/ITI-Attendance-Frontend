import { Search, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tracksData: any; // Use proper type based on your API response
  onTrackChange: (query: string) => void;
  selectedTrack: string;
  onAddStudent: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  pendingCount: number;
  verifiedCount: number;
}

const SearchToolbar = ({
  searchQuery,
  onSearchChange,
  tracksData,
  onTrackChange,
  selectedTrack,
  onAddStudent,
  onRefresh,
  isRefreshing,
  pendingCount,
  verifiedCount
}: SearchToolbarProps) => {
  const tracks = tracksData || [];
  console.log("Tracks data:", tracksData);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <div className="relative md:w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full min-w-20 flex-1">
          <Select value={selectedTrack} onValueChange={onTrackChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Track..." defaultValue=""/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tracks</SelectItem>
              {tracks.map((track: any) => (
                <SelectItem key={track.id} value={track.id.toString()}>
                  {[track.name, track.intake, track.program_type_display, track.start_date, track.default_branch]
                    .filter(Boolean)
                    .join(" - ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddStudent} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
      <div className="flex gap-2 self-start md:self-center h-10">
        <Badge variant="outline" className="gap-1 text-nowrap">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          Pending: {pendingCount || 0}
        </Badge>
        <Badge variant="outline" className="gap-1 text-nowrap">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          Verified: {verifiedCount || 0}
        </Badge>
      </div>
    </div>
  );
};

export default SearchToolbar;
