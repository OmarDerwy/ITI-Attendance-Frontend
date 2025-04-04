import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "@/components/layout/Layout";
import {
  Calendar,
  MapPin,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import branches from "@/data/branches.json";
import TrackDropdown from "@/components/schedule/TrackDropdown";
import ShareScheduleButton from "@/components/schedule/ShareScheduleButton";
import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
// import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";

const Schedule = () => {
  const { userRole } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Unified dialog state
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek"); // Track current view
  const { toast } = useToast();

  const tracks = [
    { id: "1", name: "Full Stack Web Development" },
    { id: "2", name: "Mobile App Development" },
    { id: "3", name: "Data Science & Machine Learning" },
    { id: "4", name: "UI/UX Design" },
  ];
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]?.id || ""); // Default to the first track

  const filteredEvents =
    selectedTrack === "all"
      ? events
      : events.filter((event) => event.trackId === selectedTrack);

  const [newEvent, setNewEvent] = useState({
    title: "",
    isOnline: false,
    branch: "1", // Default branch ID
  });

  const { data: defaultBranch } = { id: "1", name: "Main Branch" };
  useEffect(() => {
    if (defaultBranch) {
      setNewEvent((prev) => ({ ...prev, branch: defaultBranch.id }));
    }
  }, [defaultBranch]);

  const handleAddEvent = () => {
    if (!newEvent.title) {
      alert("Title is required.");
      return;
    }

    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        isOnline: newEvent.isOnline,
        trackId: selectedTrack === "all" ? "1" : selectedTrack,
        branch: newEvent.isOnline ? null : newEvent.branch,
        backgroundColor: newEvent.isOnline
          ? "hsl(var(--primary))"
          : "hsl(var(--accent))",
        borderColor: newEvent.isOnline
          ? "hsl(var(--primary))"
          : "hsl(var(--accent))",
        textColor: newEvent.isOnline
          ? "hsl(var(--primary-foreground))"
          : "hsl(var(--accent-foreground))",
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
              ? "hsl(var(--primary))"
              : "hsl(var(--accent))",
            borderColor: value
              ? "hsl(var(--primary))"
              : "hsl(var(--accent))", // Ensure borderColor is updated
            textColor: value
              ? "hsl(var(--primary-foreground))"
              : "hsl(var(--accent-foreground))",
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
                ? "hsl(var(--primary))"
                : "hsl(var(--accent))",
              borderColor: !event.isOnline
                ? "hsl(var(--primary))"
                : "hsl(var(--accent))",
              textColor: !event.isOnline
                ? "hsl(var(--primary-foreground))"
                : "hsl(var(--accent-foreground))",
            }
          : event
      )
    );
  };

  const updateEventBranch = (eventId, branchId) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, branch: branchId } : event
      )
    );
  };



  const handleOpenAddDialog = (selectInfo) => {
    if (currentView === 'dayGridMonth') {
      return;
    }
    if (new Date(selectInfo.start) < new Date()) {
      return; // Prevent selecting past dates
    }

    setNewEvent({
      title: "",
      isOnline: false,
      branch: defaultBranch?.id || "1",
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

  const renderEventContent = (eventInfo) => {
    const event = events.find((e) => e.id === eventInfo.event.id);
    const isOnline = event ? event.isOnline : false;

    const bgColor = isOnline ? "bg-primary" : "bg-accent";
    const textColor = isOnline
      ? "text-primary-foreground"
      : "text-accent-foreground";

    return (
      <div
        className={`flex items-center justify-between p-1 ${bgColor} ${textColor} rounded w-full h-full`}
      >
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

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayHeaderClick = (day) => {
    setSelectedDay(day);
    setIsBranchModalOpen(true);
  };

  const renderDayHeaderContent = (headerInfo) => {
    return (
      <div className="flex items-center justify-between">
        <span>{headerInfo.text}</span>
        <button
          onClick={() => handleDayHeaderClick(headerInfo.date)}
          className="text-gray-500 hover:text-gray-700"
          title="Select Branch"
        >
          <MapPin size={16} />
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <PageTitle
        title="Schedule"
        subtitle={
          userRole === "student"
            ? "View your class schedule"
            : "Manage class schedules"
        }
        icon={<Calendar />}
      />

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
          editable={userRole === "supervisor" && currentView !== "dayGridMonth"} // Modified line
          select={handleOpenAddDialog} // Use renamed function
          events={filteredEvents.filter(event => !event.allDay)} // Exclude all-day events
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
          slotMinTime="09:00:00"
          slotMaxTime="17:00:00"
          slotDuration="00:30:00" 
          snapDuration="00:30:00"
          allDaySlot={false} // Disable the all-day slot
          eventOverlap={false}
          eventDurationEditable={true}
          viewDidMount={(view) => {
            setCurrentView(view.view.type); // Track view changes
          }}
          dayHeaderContent={renderDayHeaderContent} // Add custom day header content
        />
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]"> {/* Increased modal width */}
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
              <div className="flex space-x-2 col-span-3"> {/* Dates side by side */}
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
              Select a branch for {selectedDay ? new Date(selectedDay).toDateString() : ""}
            </p>
            <Select
              onValueChange={(value) => {
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
            <Button variant="outline" onClick={() => setIsBranchModalOpen(false)}>
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
      `}</style>
    </Layout>
  );
};

export default Schedule;
