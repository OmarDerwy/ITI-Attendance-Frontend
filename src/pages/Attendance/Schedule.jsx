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
const Schedule = () => {
  const { userRole } = useUser();
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Unified dialog state
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek"); // Track current view
  const { toast } = useToast();
  // dayselect states
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [tracks, setTracks] = useState([]); 
  const [defaultBranch, setDefaultBranch] = useState(null); // State to store the default branch
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axiosBackendInstance.get("attendance/tracks/");
        const fetchedTracks = response.data.results;
        setTracks(fetchedTracks); 
        if (fetchedTracks.length > 0) {
          setSelectedTrack(fetchedTracks[0].id); // Set the first track as default
          setDefaultBranch(fetchedTracks[0].default_branch); // Set the default branch for the first track
        }
        else {
          // show in html no tracks available
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setIsLoading(false); // Stop loading after data is fetched
      }
    };

    fetchTracks();
  }, []); 


  // useEffect(() => {
  //   if (defaultBranch) {
  //     setNewEvent((prev) => ({ ...prev, branch: defaultBranch.id }));
  //   }
  // }, [defaultBranch]);
  const [selectedTrack, setSelectedTrack] = useState(""); 
  const filteredEvents = events.filter((event) => event.trackId === selectedTrack);

  const [newEvent, setNewEvent] = useState({
    title: "",
    isOnline: false,
    branch: defaultBranch, 
    instructor: "", 
  });



  const handleAddEvent = () => {
    if (!newEvent.title) {
      alert("Title is required.");
      return;
    }
    console.log("Creating event with properties:", newEvent); // Log event properties
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: newEvent.title,
        description: "Event Description",
        start: newEvent.start,
        end: newEvent.end,
        isOnline: newEvent.isOnline,
        trackId: selectedTrack === "all" ? "1" : selectedTrack,
        branch: newEvent.isOnline ? null : newEvent.branch,
        instructor: newEvent.instructor, // Include instructor
        backgroundColor: newEvent.isOnline
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        borderColor: newEvent.isOnline
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        textColor: newEvent.isOnline
          ? "hsl(var(--accent-foreground))"
          : "hsl(var(--primary-foreground))",
      },
    ]);
    setIsDialogOpen(false);
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;

    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEvent.id ? selectedEvent : event
      )
    );
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Event updated successfully.",
    });
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

    setNewEvent({
      title: "",
      instructor: "",
      isOnline: false,
      branch: selectedTrack?.defaultBranch,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
 
         setDialogMode("add");
    setIsDialogOpen(true);
  };

  const openEditDialog = (event) => {
    setSelectedEvent(event);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = () => {
    if (dialogMode === "add") {
      handleAddEvent();
    } else if (dialogMode === "edit") {
      handleUpdateEvent();
    }
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
          <span>{event.branch ? branches.find(b => b.id === event.branch)?.name : "Default Branch"}</span>
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
          className="text-gray-500 hover:text-gray-700"
          title="Select a Custom branch"
        >
          <MapPin size={16} />
        </button>
      </div>
    );
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
                    onTrackChange={setSelectedTrack}
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
                events={filteredEvents.filter((event) => !event.allDay)}
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
              />
            </Card>
          )}
        </>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {" "}
          {/* Increased modal width */}
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Add Event" : "Edit Event"}
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
                  dialogMode === "add" ? newEvent.title : selectedEvent.title
                }
                onChange={(e) =>
                  dialogMode === "add"
                    ? setNewEvent({ ...newEvent, title: e.target.value })
                    : updateSelectedEvent("title", e.target.value)
                }
                className="col-span-3 truncate" // Allow long text
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-instructor" className="text-right">
                Instructor
              </Label>
              <Input
                id="event-instructor"
                value={
                  dialogMode === "add" ? newEvent.instructor : selectedEvent.instructor
                }
                onChange={(e) =>
                  dialogMode === "add"
                    ? setNewEvent({ ...newEvent, instructor: e.target.value })
                    : updateSelectedEvent("instructor", e.target.value)
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
                    dialogMode === "add"
                      ? newEvent.isOnline
                      : selectedEvent.isOnline
                  }
                  onCheckedChange={(checked) =>
                    dialogMode === "add"
                      ? setNewEvent((prev) => ({
                          ...prev,
                          isOnline: checked,
                        }))
                      : updateSelectedEvent("isOnline", checked)
                  }
                />
                <span>
                  {dialogMode === "add"
                    ? newEvent.isOnline
                      ? "Online"
                      : "Offline"
                    : selectedEvent.isOnline
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
                {" "}
                {/* Dates side by side */}
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={
                    dialogMode === "add"
                      ? newEvent.start?.slice(0, 16)
                      : selectedEvent.start?.slice(0, 16)
                  }
                  onChange={(e) =>
                    dialogMode === "add"
                      ? setNewEvent({ ...newEvent, start: e.target.value })
                      : updateSelectedEvent("start", e.target.value)
                  }
                />
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={
                    dialogMode === "add"
                      ? newEvent.end?.slice(0, 16)
                      : selectedEvent.end?.slice(0, 16)
                  }
                  onChange={(e) =>
                    dialogMode === "add"
                      ? setNewEvent({ ...newEvent, end: e.target.value })
                      : updateSelectedEvent("end", e.target.value)
                  }
                />
              </div>
            </div>

          </div>
          <DialogFooter className="flex justify-between">
            {dialogMode === "edit" && (
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
              <Button onClick={handleDialogSubmit}>
                {dialogMode === "add" ? "Add Event" : "Update Event"}
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
              onValueChange={(value) => {
                // put logic here to handle branch selection
                // handleUpdateEvent
                setSelectedBranch(value);
                const eventsToUpdateBranch = events.filter((event) => {
                  return new Date(event.start).toLocaleDateString() === selectedDay.toLocaleDateString();
                })
                setEvents((prev) =>
                  prev.map((event) =>
                    eventsToUpdateBranch.some((e) => e.id === event.id)
                      ? {
                          ...event,
                          branch: value,
                        }
                      : event
                  )
                );
                toast({
                  title: "Success",
                  description: `Branch ${branches.find(b => b.id === value)?.name} selected for ${new Date(selectedDay).toDateString()}`,
                });
                console.log(`Branch ${value} selected for ${selectedDay}`);
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
