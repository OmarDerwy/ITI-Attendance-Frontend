
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Users, Eye, Edit, Trash2, Megaphone } from "lucide-react";

const AnnouncementsList = ({ announcements, tracks, onTogglePin, onDelete }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePin = (id) => {
    onTogglePin(id);
    
    const announcement = announcements.find(a => a.id === id);
    
    toast({
      title: announcement.isPinned ? "Announcement Unpinned" : "Announcement Pinned",
      description: announcement.isPinned 
        ? "The announcement has been unpinned from the dashboard." 
        : "The announcement has been pinned to the dashboard.",
    });
  };

  const handleDelete = (id) => {
    onDelete(id);
    
    toast({
      title: "Announcement Deleted",
      description: "The announcement has been successfully deleted.",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-medium">Manage Announcements</h3>
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search announcements..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {filteredAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className={cn(
                "p-4 border rounded-lg",
                announcement.isPinned && "bg-primary/5 border-primary/20"
              )}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      {announcement.isPinned && (
                        <Badge variant="secondary" className="text-xs">Pinned</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {announcement.track === "all" ? "All Tracks" : tracks.find(t => t.id === announcement.track)?.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {announcement.views} views
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{announcement.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTogglePin(announcement.id)}
                    >
                      {announcement.isPinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Megaphone className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-lg font-medium">No announcements found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery 
                ? "No announcements match your search criteria" 
                : "Start by creating a new announcement"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsList;
