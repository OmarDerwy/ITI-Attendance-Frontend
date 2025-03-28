
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp, Bell, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const AnnouncementCard = ({ announcements = [] }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Show only pinned and most recent announcements when collapsed
  const visibleAnnouncements = expanded 
    ? announcements 
    : announcements.filter((a, index) => a.isPinned || index < 2);
    
  if (announcements.length === 0) {
    return null;
  }
  
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Announcements</h3>
        </div>
        
        {announcements.length > 2 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 px-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                Show All ({announcements.length})
              </>
            )}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 pb-3">
        <div className="space-y-3">
          {visibleAnnouncements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={cn(
                "p-3 rounded-md",
                announcement.isPinned ? "bg-primary/5" : "bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    {announcement.isPinned && (
                      <Badge variant="secondary" className="text-xs">Pinned</Badge>
                    )}
                    {isNew(announcement.createdAt) && (
                      <Badge variant="default" className="text-xs">New</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(announcement.createdAt)}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm">{announcement.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to check if an announcement is new (less than 3 days old)
const isNew = (dateString) => {
  const announcementDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - announcementDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

// Helper function to format date in a readable format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default AnnouncementCard;
