import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "@/components/layout/Layout";
import {Calendar,MapPin,Trash2,ToggleLeft,ToggleRight,Edit} from "lucide-react";
import { Card } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import branches from "@/data/branches.json";
import TrackDropdown from "@/components/schedule/TrackDropdown";
import ShareScheduleButton from "@/components/schedule/ShareScheduleButton";
import { Select , SelectTrigger ,SelectValue , SelectItem ,SelectContent } from "@/components/ui/select";
import { Dialog,DialogContent ,DialogTitle ,DialogHeader , DialogFooter} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { axiosBackendInstance } from '@/api/config';
import { v4 as uuidv4 } from "uuid"; 
const Schedule = () => {
  const { userRole } = useUser();
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Unified dialog state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek"); // Track current view
  const { toast } = useToast();
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(""); 
  const [tracks, setTracks] = useState([]); 
  const [defaultBranch, setDefaultBranch] = useState({ name : "", id: "" }); 
  const filteredEvents = events.filter((event) => event.trackId === selectedTrack);
  const [newEvent, setNewEvent] = useState({
    id: uuidv4(), 
    title: "",
    isOnline: false,
    branch: defaultBranch, 
    instructor: "", 
  });

  const updateTrackAndBranch = (trackId, tracks) => {
    const selectedTrackData = tracks.find((track) => track.id === trackId);
    if (selectedTrackData) {
      setSelectedTrack(trackId);
      setDefaultBranch({
        name: selectedTrackData.default_branch,
        id: selectedTrackData.branch_id,
      });
    }
  };

  const handleTrackChange = (trackId) => {
    updateTrackAndBranch(trackId, tracks);
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axiosBackendInstance.get("attendance/tracks/");
        const fetchedTracks = response.data.results;
        setTracks(fetchedTracks);
        if (fetchedTracks.length > 0) {
          updateTrackAndBranch(fetchedTracks[0].id, fetchedTracks); 
        }
      } catch (error) {
        console.error("Error fetching tracks:", error); //DEV DEBUG
      } finally {
        setIsLoading(false); 
      }
    };
    fetchTracks();
  }, []); 

  const handleEventSubmit = () => {
    debugger;

    if (!selectedEvent) {
      // Add mode
      if (!newEvent.title) {
        alert("Title is required.");
        return;
      }
      console.log("Creating event with properties:", newEvent); //DEV DEBUG
      const newEventData = {
        id: uuidv4(), // Use uuid to generate a unique ID
        title: newEvent.title,
        instructor: newEvent.instructor,
        start: newEvent.start,
        end: newEvent.end,
        isOnline: newEvent.isOnline,
        trackId: selectedTrack === "all" ? "1" : selectedTrack,
        branch: newEvent.isOnline ? null : newEvent.branch,
        backgroundColor: newEvent.isOnline
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        borderColor: newEvent.isOnline
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        textColor: newEvent.isOnline
          ? "hsl(var(--accent-foreground))"
          : "hsl(var(--primary-foreground))",
      };
      setEvents((prev) => [...prev, newEventData]); // Update events state
    } else {
      // Edit mode
      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id ? selectedEvent : event
        )
      );
      toast({
        title: "Success",
        description: "Event updated successfully.",
      });
    }
    setIsDialogOpen(false);
    setSelectedEvent(null); // Reset selectedEvent after submission
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setIsDialogOpen(false);
    }
  };

  const handleEventResize = (resizeInfo) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === resizeInfo.event.id
          ? {
              ...event,
              start: resizeInfo.event.startStr,
              end: resizeInfo.event.endStr,
            }
          : event
      )
    );
  };
  const updateSelectedEvent = (field, value) => {
    setSelectedEvent((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "isOnline"
        ? {
            backgroundColor: value
              ? "hsl(var(--accent))"
              : "hsl(var(--primary))",
            borderColor: value ? "hsl(var(--accent))" : "hsl(var(--primary))",
            textColor: value
              ? "hsl(var(--accent-foreground))"
              : "hsl(var(--primary-foreground))",
            ...(value ? { branch: null } : {}), // Clear branch if online
          }
        : {}),
    }));
  };
  const toggleEventType = (eventId) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isOnline: !event.isOnline,
              backgroundColor: !event.isOnline
                ? "hsl(var(--accent))"
                : "hsl(var(--primary))",
              borderColor: !event.isOnline
                ? "hsl(var(--accent))"
                : "hsl(var(--primary))",
              textColor: !event.isOnline
                ? "hsl(var(--accent-foreground))"
                : "hsl(var(--primary-foreground))",
            }
          : event
      )
    );
  };

  const handleOpenAddDialog = (selectInfo) => {
    if (currentView === "dayGridMonth") {
      return;
    }
    if (new Date(selectInfo.start) < new Date()) {
      return; // Prevent selecting past dates
    }
    debugger;
    // Check for events on the same day and use their branch if available
    const eventsOnSameDay = events.filter((event) => {
      return new Date(event.start).toLocaleDateString() === selectInfo.start.toLocaleDateString();
    });
    setNewEvent({
      id: uuidv4(), // Ensure a new unique ID is generated for each new event
      title: "",
      instructor: "",
      isOnline: false,
      branch: eventsOnSameDay.length > 0 ? eventsOnSameDay[0].branch : defaultBranch, 
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });

    setSelectedEvent(null); // Ensure selectedEvent is null for add mode
    setIsDialogOpen(true);
  };

  const openEditDialog = (event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDayHeaderClick = (day) => {
    setSelectedDay(day);
    setIsBranchModalOpen(true);
  };
  const renderEventContent = (eventInfo) => {
    const event = events.find((e) => e.id === eventInfo.event.id);
    const isOnline = event ? event.isOnline : false;
    const bgColor = isOnline ? "bg-accent" : "bg-primary";
    const textColor = isOnline ? "text-accent-foreground" : "text-primary-foreground";
    const subtextColor = isOnline ? "text-gray-700" : "text-white-500"; // Updated subtext color
    const branchColor = isOnline ? "text-gray-700" : "text-gray-500"; // Updated branch color
    return (
      <div
        className={`flex items-center justify-between p-1 ${bgColor} ${textColor} rounded w-full h-full`}
      >
        <div className="p-1 flex-col">
          <div className="whitespace-normal">{eventInfo.event.title}</div>
          <div className={`text-xs ${subtextColor}`}>
            {eventInfo.event.extendedProps.instructor || ""}
          </div>
        </div>
        <div className="flex space-x-1 absolute right-1 top-1 items-center">
          <button
            onClick={(e) => {
              toggleEventType(eventInfo.event.id);
            }}
            className={`${textColor} hover:opacity-80`}
            title={isOnline ? "Switch to Offline" : "Switch to Online"}
          >
            {isOnline ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
          <button
            onClick={(e) => {
              handleDeleteEvent(eventInfo.event.id);
            }}
            className={`${textColor} hover:opacity-80`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="absolute bottom-1 left-1 flex items-center text-xs ${branchColor}">
          <MapPin size={12} className="mr-1" />
          {/* here */}
          <span> {eventInfo.event.extendedProps.branch.name }</span>
        </div>
      </div>
    );
  };
  const renderDayHeaderContent = (headerInfo) => {
    return (
      <div className="flex items-center justify-between">
        <span>{headerInfo.text}</span>
        <button
          onClick={() => handleDayHeaderClick(headerInfo.date)}
          className="text-red-500 hover:text-gray-700 m-3"
          title="Select a Custom branch"
        >
          <MapPin size={16} />
        </button>
      </div>
    );
  };

  const handleEventDrop = (dropInfo) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === dropInfo.event.id
          ? {
              ...event,
              start: dropInfo.event.startStr,
              end: dropInfo.event.endStr,
            }
          : event
      )
    );
    toast({
      title: "Success",
      description: "Event moved successfully.",
    });
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          <PageTitle
            title="Schedule"
            subtitle={
              userRole === "student"
                ? "View your class schedule"
                : "Manage class schedules"
            }
            icon={<Calendar />}
          />

          {tracks.length === 0 ? (
            <p className="text-gray-500 text-center">
              No tracks assigned.
            </p>
          ) : (
            <Card className="p-6 bg-white border shadow-lg">
              <div className="mb-4 flex flex-col md:flex-row items-center gap-4 md:justify-between">
                {userRole === "supervisor" && (
                  <p className="text-red-700 font-medium md:order-1 md:w-auto w-full text-center md:text-left">
                    Click on a date to add a session.
                  </p>
                )}
                <div className="flex-1 md:order-2 w-full md:w-auto">
                  <TrackDropdown
                    tracks={tracks}
                    selectedTrack={selectedTrack}
                    onTrackChange={handleTrackChange}
                  />
                </div>
                {userRole === "supervisor" && (
                  <div className="md:order-3">
                    <ShareScheduleButton
                      events={filteredEvents}
                      track={selectedTrack}
                    />
                  </div>
                )}
              </div>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                selectable={userRole === "supervisor"}
                editable={userRole === "supervisor" && currentView !== "dayGridMonth"}
                select={handleOpenAddDialog}
                events={filteredEvents}
                eventClick={(clickInfo) =>
                  openEditDialog(events.find((e) => e.id === clickInfo.event.id))
                }
                eventResize={handleEventResize}
                eventContent={renderEventContent}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"
                validRange={{ start: new Date() }}
                timeZone="local"
                nowIndicator={true}
                now={new Date()}
                slotMinTime="09:00:00"
                slotMaxTime="24:00:00"
                slotDuration="00:30:00"
                snapDuration="00:30:00"
                
                allDaySlot={false}
                eventOverlap={false}
                eventDurationEditable={true}
                viewDidMount={(view) => {
                  setCurrentView(view.view.type);
                }}
                dayHeaderContent={renderDayHeaderContent}
                eventDrop={handleEventDrop} // Add this prop to handle event dragging
                selectAllow={function(selectInfo) {
                  const start = selectInfo.start;
                  const end = selectInfo.end;
                
                  // Allow only if start and end are on the same calendar day
                  return start.toDateString() === end.toDateString();
                }}
              />
            </Card>
          )}
        </>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Add Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title
              </Label>
              <Input
                id="event-title"
                value={
                  selectedEvent ? selectedEvent.title : newEvent.title
                }
                onChange={(e) =>
                  selectedEvent
                    ? updateSelectedEvent("title", e.target.value)
                    : setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="col-span-3 truncate" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-instructor" className="text-right">
                Instructor
              </Label>
              <Input
                id="event-instructor"
                value={
                  selectedEvent ? selectedEvent.instructor : newEvent.instructor
                }
                onChange={(e) =>
                  selectedEvent
                    ? updateSelectedEvent("instructor", e.target.value)
                    : setNewEvent({ ...newEvent, instructor: e.target.value })
                }
                className="col-span-3 truncate" // Allow long text
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-online" className="text-right">
                Online
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="event-online"
                  checked={
                    selectedEvent
                      ? selectedEvent.isOnline
                      : newEvent.isOnline
                  }
                  onCheckedChange={(checked) =>
                    selectedEvent
                      ? updateSelectedEvent("isOnline", checked)
                      : setNewEvent((prev) => ({
                          ...prev,
                          isOnline: checked,
                        }))
                  }
                />
                <span>
                  {selectedEvent
                    ? selectedEvent.isOnline
                      ? "Online"
                      : "Offline"
                    : newEvent.isOnline
                    ? "Online"
                    : "Offline"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-dates" className="text-right">
                Dates
              </Label>
              <div className="flex space-x-2 col-span-3">
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={
                    selectedEvent
                      ? selectedEvent.start?.slice(0, 16)
                      : newEvent.start?.slice(0, 16)
                  }
                  onChange={(e) =>
                    selectedEvent
                      ? updateSelectedEvent("start", e.target.value)
                      : setNewEvent({ ...newEvent, start: e.target.value })
                  }
                />
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={
                    selectedEvent
                      ? selectedEvent.end?.slice(0, 16)
                      : newEvent.end?.slice(0, 16)
                  }
                  onChange={(e) =>
                    selectedEvent
                      ? updateSelectedEvent("end", e.target.value)
                      : setNewEvent({ ...newEvent, end: e.target.value })
                  }
                />
              </div>
            </div>

          </div>
          <DialogFooter className="flex justify-between">
            {selectedEvent && (
              <Button
                variant="destructive"
                onClick={() =>
                  selectedEvent && handleDeleteEvent(selectedEvent.id)
                }
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEventSubmit}>
                {selectedEvent ? "Update Event" : "Add Event"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isBranchModalOpen} onOpenChange={setIsBranchModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Select Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Select a branch for{" "}
              {selectedDay ? new Date(selectedDay).toDateString() : ""}
            </p>
            <Select
              onValueChange={(value ) => {
                // put logic here to handle branch selection
                // handleUpdateEvent
                const selectedBranchData = branches.find((branch) => branch.id === value);
                setSelectedBranch({
                  id: selectedBranchData.id,
                  name: selectedBranchData.name,
                });
                const eventsToUpdateBranch = events.filter((event) => {
                  return new Date(event.start).toLocaleDateString() === selectedDay.toLocaleDateString();
                })

                console.log(`Branch ${value} selected for ${selectedDay}`);

                setEvents((prev) =>
                  prev.map((event) =>
                    eventsToUpdateBranch.some((e) => e.id === event.id)
                      ? {
                          ...event,
                          branch: selectedBranchData,
                        }
                      : event
                  )
                );
                toast({
                  title: "Success",
                  description: `Branch ${selectedBranchData.name} selected for ${new Date(selectedDay).toDateString()}`,
                });
                setIsBranchModalOpen(false);
              }}
            >
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBranchModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        .fc-button {
          background-color: #ef4444 !important;
          border-color: #ef4444 !important;
          color: white !important;
        }
        .fc-button:hover {
          background-color: #dc2626 !important;
          border-color: #dc2626 !important;
        }

        .fc-event {
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: 500;
        }
        .fc-event-title {
          white-space: normal !important; /* Allow text wrapping */
          overflow: visible !important; /* Show full text */
          text-overflow: clip !important; /* Prevent ellipsis */
          word-wrap: break-word !important; /* Break long words */
        }
        .fc-daygrid-event {
          height: auto !important; /* Adjust event height */
        }

      `}</style>
    </Layout>
  );
};

export default Schedule;
