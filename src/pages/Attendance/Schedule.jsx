import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "@/components/layout/Layout";
import { Calendar, MapPin, Share, Trash2, ToggleLeft, ToggleRight, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import branches from "@/data/branches.json";

const Schedule = () => {
  const { userRole } = useUser();
  const [events, setEvents] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [shareDates, setShareDates] = useState({ from: "", to: "" });
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);

  const tracks = [
    { id: "1", name: "Full Stack Web Development" },
    { id: "2", name: "Mobile App Development" },
    { id: "3", name: "Data Science & Machine Learning" },
    { id: "4", name: "UI/UX Design" }
  ];

  // Filter events based on selected track
  const filteredEvents = selectedTrack === "all" 
    ? events 
    : events.filter(event => event.trackId === selectedTrack);

  // Handle adding an event
  const handleDateSelect = (selectInfo) => {
    const title = prompt("Enter session title:");
    if (title) {
      setEvents((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          isOnline: false, // Default to offline (accent color)
          trackId: selectedTrack === "all" ? "1" : selectedTrack, // Assign to selected track
          branch: "1", // Default branch
          backgroundColor: 'hsl(var(--accent))', // Default background color for offline events
          borderColor: 'hsl(var(--accent))', // Match border color
          textColor: 'hsl(var(--accent-foreground))', // Text color
        },
      ]);
    }
  };

  // Handle event click to open the edit dialog
  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent({
        ...event,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr
      });
      setIsEditDialogOpen(true);
    }
  };

  // Handle updating the selected event
  const handleUpdateEvent = () => {
    if (!selectedEvent) return;
    
    setEvents(prev => 
      prev.map(event => 
        event.id === selectedEvent.id 
          ? selectedEvent 
          : event
      )
    );
    setIsEditDialogOpen(false);
    toast.success("Event updated successfully");
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setIsEditDialogOpen(false);
    }
  };

  // Handle event resizing
  const handleEventResize = (resizeInfo) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === resizeInfo.event.id
          ? { 
              ...event, 
              start: resizeInfo.event.startStr, 
              end: resizeInfo.event.endStr 
            }
          : event
      )
    );
  };

  // Toggle event type (online/offline)
  const toggleEventType = (eventId) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isOnline: !event.isOnline,
              backgroundColor: !event.isOnline ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
              borderColor: !event.isOnline ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
              textColor: !event.isOnline ? 'hsl(var(--primary-foreground))' : 'hsl(var(--accent-foreground))',
            } 
          : event
      )
    );
  };

  // Update event branch
  const updateEventBranch = (eventId, branchId) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, branch: branchId } 
          : event
      )
    );
  };

  // Handle sharing schedule
  const handleShareSchedule = () => {
    if (!shareDates.from || !shareDates.to) {
      toast.error("Please select both from and to dates");
      return;
    }
    
    // Implementation of sharing functionality would go here
    toast.success(`Schedule shared with students from ${shareDates.from} to ${shareDates.to}`);
    setIsShareDialogOpen(false);
  };

  // Update selected event properties
  const updateSelectedEvent = (field, value) => {
    setSelectedEvent(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'isOnline' ? {
        backgroundColor: value ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
        borderColor: value ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
        textColor: value ? 'hsl(var(--primary-foreground))' : 'hsl(var(--accent-foreground))',
      } : {})
    }));
  };

  // Custom event rendering with toggle and location buttons
  const renderEventContent = (eventInfo) => {
    const event = events.find(e => e.id === eventInfo.event.id);
    const isOnline = event ? event.isOnline : false;
    const branchId = event ? event.branch : "1";
    const branchName = branches.find(b => b.id === branchId)?.name || "Unknown";

    // Get theme-appropriate colors
    const bgColor = isOnline ? 'bg-primary' : 'bg-accent';
    const textColor = isOnline ? 'text-primary-foreground' : 'text-accent-foreground';

    return (
      <div className={`flex items-center justify-between p-1 ${bgColor} ${textColor} rounded w-full h-full`}>
        <div className="flex-1 truncate mr-1">{eventInfo.event.title}</div>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleEventType(eventInfo.event.id);
            }}
            className={`${textColor} hover:opacity-80`}
            title={isOnline ? "Switch to Offline" : "Switch to Online"}
          >
            {isOnline ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
          
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={`${textColor} hover:opacity-80`}
                title="Select Branch"
              >
                <MapPin size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-2">
                <h3 className="font-medium">Select Branch</h3>
                <Select 
                  defaultValue={branchId} 
                  onValueChange={(value) => {
                    updateEventBranch(eventInfo.event.id, value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Current: {branchName}</p>
              </div>
            </PopoverContent>
          </Popover>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEvent(eventInfo.event.id);
            }}
            className={`${textColor} hover:opacity-80`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <PageTitle
        title="Schedule"
        subtitle={userRole === "student" ? "View your class schedule" : "Manage class schedules"}
        icon={<Calendar />}
      />
      <Card className="p-6 bg-white border shadow-lg">
        <div className="mb-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-64">
              <Select
                value={selectedTrack}
                onValueChange={setSelectedTrack}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {tracks.map(track => (
                    <SelectItem key={track.id} value={track.id}>{track.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {userRole === "supervisor" && (
              <p className="text-red-700 font-medium">Click on a date to add a session.</p>
            )}
          </div>
          
          {userRole === "supervisor" && (
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share className="h-4 w-4 mr-2" /> Share with students
            </Button>
          )}
        </div>
        
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={userRole === "supervisor"}
          editable={true}
          select={handleDateSelect}
          events={filteredEvents}
          eventClick={handleEventClick}
          eventResize={handleEventResize}
          height="auto"
          eventContent={renderEventContent}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          validRange={{ start: new Date() }}
          slotMinTime="08:00:00"
          slotMaxTime="17:00:00"
        />
      </Card>

      {/* Share with students dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Schedule with Students</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from-date" className="text-right">
                From Date
              </Label>
              <input
                id="from-date"
                type="date"
                className="col-span-3 p-2 border rounded"
                value={shareDates.from}
                onChange={(e) => setShareDates({...shareDates, from: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to-date" className="text-right">
                To Date
              </Label>
              <input
                id="to-date"
                type="date"
                className="col-span-3 p-2 border rounded"
                value={shareDates.to}
                onChange={(e) => setShareDates({...shareDates, to: e.target.value})}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareSchedule}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit event dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="event-title"
                  value={selectedEvent.title}
                  onChange={(e) => updateSelectedEvent('title', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-track" className="text-right">
                  Track
                </Label>
                <Select
                  value={selectedEvent.trackId}
                  onValueChange={(value) => updateSelectedEvent('trackId', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent>
                    {tracks.map(track => (
                      <SelectItem key={track.id} value={track.id}>{track.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-branch" className="text-right">
                  Branch
                </Label>
                <Select
                  value={selectedEvent.branch}
                  onValueChange={(value) => updateSelectedEvent('branch', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-online" className="text-right">
                  Online
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="event-online"
                    checked={selectedEvent.isOnline}
                    onCheckedChange={(checked) => updateSelectedEvent('isOnline', checked)}
                  />
                  <span>{selectedEvent.isOnline ? "Online" : "Offline"}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-start" className="text-right">
                  Start
                </Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={selectedEvent.start.slice(0, 16)}
                  onChange={(e) => updateSelectedEvent('start', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-end" className="text-right">
                  End
                </Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={selectedEvent.end.slice(0, 16)}
                  onChange={(e) => updateSelectedEvent('end', e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateEvent}>
                <Edit className="h-4 w-4 mr-2" /> Update
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        .fc-button {
          background-color: #ef4444 !important; /* Red background */
          border-color: #ef4444 !important;
          color: white !important;
        }
        .fc-button:hover {
          background-color: #dc2626 !important; /* Darker red on hover */
          border-color: #dc2626 !important;
        }
        .fc-event {
          cursor: pointer;
        }
      `}</style>
    </Layout>
  );
};

export default Schedule;