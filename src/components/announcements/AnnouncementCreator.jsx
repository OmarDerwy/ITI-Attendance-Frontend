
import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AnnouncementCreator = ({ onAnnouncementCreate, tracks }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetTrack, setTargetTrack] = useState("all");
  const [publishNow, setPublishNow] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content fields.",
        variant: "destructive"
      });
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      author: "Admin User",
      track: targetTrack,
      isPinned,
      isActive: true,
      views: 0
    };

    onAnnouncementCreate(newAnnouncement);
    
    toast({
      title: "Announcement Published",
      description: sendNotification 
        ? "The announcement has been published and notifications sent." 
        : "The announcement has been published.",
    });

    // Reset form
    setTitle("");
    setContent("");
    setTargetTrack("all");
    setIsPinned(false);
    setSendNotification(true);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Create New Announcement</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Announcement Title</Label>
          <Input
            id="title"
            placeholder="Enter announcement title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Announcement Content</Label>
          <Textarea
            id="content"
            placeholder="Enter the details of your announcement..."
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="track">Target Audience</Label>
          <Select value={targetTrack} onValueChange={setTargetTrack}>
            <SelectTrigger>
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
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pinned">Pin to Dashboard</Label>
              <p className="text-sm text-muted-foreground">
                Pinned announcements will be displayed at the top of the dashboard
              </p>
            </div>
            <Switch
              id="pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification">Send Notification</Label>
              <p className="text-sm text-muted-foreground">
                Users will receive a notification about this announcement
              </p>
            </div>
            <Switch
              id="notification"
              checked={sendNotification}
              onCheckedChange={setSendNotification}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          {publishNow ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Will be published immediately
            </span>
          ) : (
            <span>Scheduled for later publication</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Preview</Button>
          <Button onClick={handlePublish}>Publish Announcement</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCreator;
