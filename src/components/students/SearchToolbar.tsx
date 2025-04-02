import { Search, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddStudent: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  pendingCount: number;
  verifiedCount: number;
}

const SearchToolbar = ({
  searchQuery,
  onSearchChange,
  onAddStudent,
  onRefresh,
  isRefreshing,
  pendingCount,
  verifiedCount
}: SearchToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex gap-2 w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
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
      <div className="flex gap-2">
        <Badge variant="outline" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          Pending: {pendingCount}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          Verified: {verifiedCount}
        </Badge>
      </div>
    </div>
  );
};

export default SearchToolbar;
