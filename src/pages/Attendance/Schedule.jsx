import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "@/components/layout/Layout";
import {
  Calendar,
  MapPin,
  Trash2,
  AlertTriangle,
  X,
  MapPinned,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import TrackDropdown from "@/components/schedule/TrackDropdown";
import SessionsBulkCreateUpdate from "@/components/schedule/SessionsBulkCreateUpdate";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { axiosBackendInstance } from "@/api/config";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useBeforeUnload } from "react-router-dom";
import { toast } from "sonner";
import { getDate } from "date-fns";

const Schedule = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [tracks, setTracks] = useState([]);
  const [defaultBranch, setDefaultBranch] = useState({ name: "", id: "" });
  // Add state for tracking unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [navigationPath, setNavigationPath] = useState("");
  // Add state for pending track change
  const [pendingTrackId, setPendingTrackId] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const filteredEvents = events.filter(
    (event) => event.trackId === selectedTrack
  );
  const [newEvent, setNewEvent] = useState({
    id: "react" + uuidv4(),
    title: "",
    isOnline: false,
    branch: defaultBranch,
    instructor: "",
  });
  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the start of the day
    const inputDate = new Date(date);
    return inputDate < today; // Check if the input date is before today
  };
  const [branches, setFetchedBranches] = useState([]);

  // Track if there are modified events
  const modifiedEvents = events.filter((event) => event.isModified);

  // Effect to set hasUnsavedChanges based on modified events
  useEffect(() => {
    setHasUnsavedChanges(modifiedEvents.length > 0);
  }, [modifiedEvents.length]);

  // Prompt when user tries to leave with unsaved changes
  useBeforeUnload(
    useCallback(
      (event) => {
        if (hasUnsavedChanges) {
          event.preventDefault();
          return (event.returnValue =
            "You have unsaved changes. Are you sure you want to leave?");
        }
      },
      [hasUnsavedChanges]
    )
  );

  // Handle navigation attempts
  const handleNavigation = useCallback(
    (path) => {
      if (hasUnsavedChanges) {
        setNavigationPath(path);
        setIsLeaveConfirmOpen(true);
      } else {
        navigate(path);
      }
    },
    [hasUnsavedChanges, navigate]
  );

  // Override the history's push method
  useEffect(() => {
    const originalPush = history.pushState;
    history.pushState = function () {
      if (hasUnsavedChanges) {
        setIsLeaveConfirmOpen(true);
        return;
      }
      return originalPush.apply(this, arguments);
    };

    return () => {
      history.pushState = originalPush;
    };
  }, [hasUnsavedChanges]);

  // Mark changes as saved
  const handleChangesSaved = useCallback(() => {
    setHasUnsavedChanges(false);
    // Reset isModified flag on all events
    setEvents((prevEvents) =>
      prevEvents.map((event) => ({
        ...event,
        isModified: false,
      }))
    );
    // Refresh calendar data after saving
    fetchEvents(selectedTrack);
  }, [selectedTrack]);

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

  const fetchEvents = async (trackId) => {
    try {
      const response = await axiosBackendInstance.get(
        `attendance/sessions/calendar-data/?track_id=${trackId}`
      );
      const fetchedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.title,
        instructor: event.instructor,
        start: event.start,
        end: event.end,
        isOnline: event.is_online,
        trackId: event.track_id,
        schedule_date: event.schedule_date,
        schedule_id: event.schedule_id,
        branch: event.branch,
        backgroundColor: event.is_online
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        borderColor: event.is_online
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        textColor: event.is_online
          ? "hsl(var(--accent-foreground))"
          : "hsl(var(--primary-foreground))",
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events:", error); // DEV DEBUG
    }
  };

  // Modify handleTrackChange to check for unsaved changes
  const handleTrackChange = (trackId) => {
    if (hasUnsavedChanges) {
      // Store the track ID that the user wants to switch to
      setPendingTrackId(trackId);
      // Show confirmation dialog
      setIsLeaveConfirmOpen(true);
    } else {
      // No unsaved changes, proceed with track change
      applyTrackChange(trackId);
    }
  };

  // New function to actually apply track change
  const applyTrackChange = (trackId) => {
    updateTrackAndBranch(trackId, tracks);
    fetchEvents(trackId);
    // Reset pending track ID
    setPendingTrackId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branches first
        const branchesResponse = await axiosBackendInstance.get(
          "attendance/branches/"
        );
        setFetchedBranches(branchesResponse.data);

        // Fetch tracks after branches
        const tracksResponse = await axiosBackendInstance.get(
          "attendance/tracks/"
        );
        const fetchedTracks = tracksResponse.data;
        setTracks(fetchedTracks);

        if (fetchedTracks.length > 0) {
          const initialTrackId = fetchedTracks[0].id;
          updateTrackAndBranch(initialTrackId, fetchedTracks);
          await fetchEvents(initialTrackId); // Fetch events for the initial track
        }
      } catch (error) {
        console.error("Error fetching data:", error); // DEV DEBUG
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup function to handle any potential event listener issues
    return () => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.destroy();
      }
    };
  }, []);

  const handleEventSubmit = () => {
    const startDate = new Date(selectedEvent ? selectedEvent.start : newEvent.start);
    const endDate = new Date(selectedEvent ? selectedEvent.end : newEvent.end);
  
    // Validate that start date equals end date
    if (startDate.toDateString() !== endDate.toDateString()) {
      toast.error("Session duration must be on the same day.");
      return;
    }
    // Validate that start time is before end time
    if (startDate >= endDate) {
      toast.error("Start time must be before end time.");
      return;
    }
    if (isDateInPast(startDate)) {
      toast.error("Cannot add sessions to past dates");
      return;
    }
  
    // Validate that the event does not overlap with existing events
    const isOverlapping = events.some((event) => {
      if (selectedEvent && event.id === selectedEvent.id) return false; // Skip the current event in edit mode
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (startDate >= eventStart && startDate < eventEnd) || // Overlaps start
        (endDate > eventStart && endDate <= eventEnd) || // Overlaps end
        (startDate <= eventStart && endDate >= eventEnd) // Fully overlaps
      );
    });
  
    if (isOverlapping) {
      toast.error("This event overlaps with an existing event.");
      return;
    }
  
    // Proceed with adding or updating the event
    if (!selectedEvent) {
      // Add mode
      if (!newEvent.title) {
        alert("Title is required.");
        return;
      }
      const newEventData = {
        id: "react" + uuidv4(),
        title: newEvent.title,
        instructor: newEvent.instructor,
        start: newEvent.start,
        end: newEvent.end,
        isOnline: newEvent.isOnline,
        trackId: selectedTrack,
        branch: newEvent.branch,
        backgroundColor: newEvent.isOnline
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        borderColor: newEvent.isOnline
          ? "hsl(var(--accent))"
          : "hsl(var(--primary))",
        textColor: newEvent.isOnline
          ? "hsl(var(--accent-foreground))"
          : "hsl(var(--primary-foreground))",
        isModified: true, // Mark as modified
      };
      setEvents((prev) => [...prev, newEventData]); // Update events state
      setHasUnsavedChanges(true);
    } else {
      // Edit mode
      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id
            ? { ...selectedEvent, isModified: true } // Mark as modified
            : event
        )
      );
      setHasUnsavedChanges(true);
    }
    setIsDialogOpen(false);
    setSelectedEvent(null); // Reset selectedEvent after submission
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      const event = events.find((e) => String(e.id) === String(eventToDelete));
      
      // Check if event is in the past
      if (event && isDateInPast(event.start)) {
        toast.error("Cannot delete sessions from past dates");
        setEventToDelete(null);
        setIsDeleteConfirmOpen(false);
        return;
      }
      
      // Continue with the existing delete logic
      if (!event || !event.schedule_id) {
        // If the event is not saved (no schedule_id), remove it locally
        setEvents((prev) =>
          prev.filter((e) => String(e.id) !== String(eventToDelete))
        );
        toast.success("You have cancelled the event.");
        setEventToDelete(null);
        setIsDeleteConfirmOpen(false);
        return;
      }

      try {
        // Call API to delete the session
        await axiosBackendInstance.delete(
          `attendance/sessions/${eventToDelete}/`
        );
        setEvents((prev) =>
          prev.filter((e) => String(e.id) !== String(eventToDelete))
        );
        toast.success("Event deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete the event. Please try again.");
      }
      setEventToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleEventResize = (resizeInfo) => {
    // Prevent resizing events in past dates
    if (isDateInPast(resizeInfo.event.start)) {
      resizeInfo.revert(); // Revert the resize operation
      toast.error("Cannot modify sessions from past dates");
      return;
    }
    setEvents((prev) =>
      prev.map((event) =>
        String(event.id) === String(resizeInfo.event.id)
          ? {
              ...event,
              start: resizeInfo.event.startStr,
              end: resizeInfo.event.endStr,
              isModified: true, // Mark as modified
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
          }
        : {}),
    }));
  };
  const toggleEventType = (e, eventId) => {
    e.stopPropagation();
    
    // First check if event is in the past
    const event = events.find(e => String(e.id) === String(eventId));
    if (event && isDateInPast(event.start)) {
      toast.error("Cannot modify sessions from past dates");
      return;
    }
    
    setEvents((prev) => {
      const updatedEvents = prev.map((event) => {
        if (String(event.id) === String(eventId)) {
          const currentIsOnline = event.isOnline;
          const isOnline = !currentIsOnline;
          return {
            ...event,
            isOnline,
            backgroundColor: isOnline
              ? "hsl(var(--accent))"
              : "hsl(var(--primary))",
            borderColor: isOnline
              ? "hsl(var(--accent))"
              : "hsl(var(--primary))",
            textColor: isOnline
              ? "hsl(var(--accent-foreground))"
              : "hsl(var(--primary-foreground))",
            isModified: true,
          };
        }
        return event;
      });
      return updatedEvents;
    });
  };
  const handleEventDrop = (dropInfo) => {
    // Prevent dropping to a past date
    if (isDateInPast(dropInfo.event.start)) {
      dropInfo.revert(); // Revert the drag operation
      toast.error("Cannot modify sessions from past dates");
      return;
    }
    setEvents((prev) =>
      prev.map((event) =>
        String(event.id) === String(dropInfo.event.id)
          ? {
              ...event,
              start: dropInfo.event.startStr,
              end: dropInfo.event.endStr,
              isModified: true,
            }
          : event
      )
    );
  };
  const handleOpenAddDialog = (selectInfo) => {
    if (currentView === "dayGridMonth") {
      return;
    }
    // Check if selected date is in the past
    if (isDateInPast(selectInfo.start)) {
      toast.error("Cannot add sessions to past dates");
      return;
    }
    // Reset selectedEvent to ensure we're in "add" mode, not "edit" mode
    setSelectedEvent(null);

    // Check for events on the same day and use their branch if available
    const eventsOnSameDay = events.filter((event) => {
      return (
        new Date(event.start).toLocaleDateString() ===
        selectInfo.start.toLocaleDateString()
      );
    });
    setNewEvent({
      id: "react" + uuidv4(),
      title: "",
      instructor: "",
      isOnline: false,
      branch:
        eventsOnSameDay.length > 0 ? eventsOnSameDay[0].branch : defaultBranch,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      schedule_date: selectInfo.startStr.slice(0, 10),
    });

    setIsDialogOpen(true);
  };

  const openEditDialog = (event) => {
    // Check if event is in the past before allowing edit
    if (isDateInPast(event.start)) {
      toast.info("Cannot modify sessions from past dates");
      return;
    }
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDayHeaderClick = (day) => {
    // Prevent branch selection for past days
    if (isDateInPast(day)) {
      toast.info("Cannot change branch for past dates");
      return;
    }
    
    setSelectedDay(day);
    setIsBranchModalOpen(true);
  };
  const renderEventContent = (eventInfo) => {
    // Directly use eventInfo's extendedProps to get accurate isOnline state
    const isOnline = Boolean(eventInfo.event.extendedProps.isOnline);
    const bgColor = isOnline ? "bg-accent" : "bg-primary";
    const textColor = isOnline
      ? "text-accent-foreground"
      : "text-primary-foreground";
    const subtextColor = isOnline ? "text-gray-700" : "text-gray-300";
    const branchColor = isOnline ? "text-gray-700" : "text-gray-300";
    
    // Check if event is in the past
    const isPastEvent = isDateInPast(eventInfo.event.start);

    return (
      <div
        className={`flex items-center justify-between p-1 ${bgColor} ${textColor} rounded w-full h-full ${isPastEvent ? 'opacity-75' : ''}`}
      >
        {currentView !== "dayGridMonth" && (
          <div
            className={`flex space-x-1 absolute right-1 top-1 items-center text-xs italic font-bold ${branchColor}`}
          >
            {isOnline ? (
              <>
                <MapPin size={12} className="mr-1" />
                <span>Home</span>
              </>
            ) : (
              <>
                <MapPin size={12} className="mr-1" />
                <span>{eventInfo.event.extendedProps.branch?.name}</span>
              </>
            )}
          </div>
        )}
        <div className="p-1 flex-col">
          <div className="whitespace-normal">{eventInfo.event.title}</div>
          <div className={`text-xs ${subtextColor}`}>
            {eventInfo.event.extendedProps.instructor || ""}
          </div>
        </div>
        {!isPastEvent && (
          <div className="flex space-x-1 absolute right-1 bottom-1 items-center">
            <button
              onClick={(e) => {
                e.preventDefault(); // Ensure event doesn't bubble
                toggleEventType(e, eventInfo.event.id);
              }}
              className={`${textColor} hover:opacity-80 flex items-center justify-center`}
              title={isOnline ? "Switch to Offline" : "Switch to Online"}
            >
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent dialog from opening
                setEventToDelete(eventInfo.event.id);
                setIsDeleteConfirmOpen(true);
              }}
              className={`${textColor} hover:opacity-80`}
              title="Delete"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    );
  };
  const renderDayHeaderContent = (headerInfo) => {
    // Check if day is in the past
    
    return (
      <div className="flex items-center justify-between">
        <span>{headerInfo.text}</span>
          <button
            onClick={() => handleDayHeaderClick(headerInfo.date)}
            className="text-gray-500 hover:text-gray-800 m-3 "
            title="Select a Custom branch"
          >
            <MapPinned size={16} />
          </button>
      </div>
    );
  };

  const handleBranchSelection = (branchId) => {
    const selectedBranchData = branches.find(
      (branch) => branch.id === branchId
    );
    if (!selectedBranchData) {
      toast.info("Could not find the selected branch.");
      return;
    }
    setSelectedBranch({
      id: selectedBranchData.id,
      name: selectedBranchData.name,
    });
    // Get selected day as a date string for comparison
    const selectedDayString = selectedDay.toLocaleDateString();
    setEvents((prev) =>
      prev.map((event) => {
        const eventDate = new Date(event.start).toLocaleDateString();
        if (eventDate === selectedDayString && !event.isOnline) {
          return {
            ...event,
            branch: selectedBranchData,
            isModified: true,
          };
        }
        return event;
      })
    );
    setIsBranchModalOpen(false);
  };

  return (
    <Layout>
      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
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
            <p className="text-gray-500 text-center">No tracks assigned.</p>
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
                    <SessionsBulkCreateUpdate
                      events={[...events.filter((event) => event.isModified)]}
                      track={selectedTrack}
                      onSaveSuccess={handleChangesSaved}
                    />
                  </div>
                )}
              </div>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                selectable={userRole === "supervisor"}
                editable={
                  userRole === "supervisor" && currentView !== "dayGridMonth"
                }
                select={handleOpenAddDialog}
                events={filteredEvents}
                // click on existing events to edit
                eventClick={(clickInfo) => {
                  const event = events.find(
                    (e) => String(e.id) === String(clickInfo.event.id)
                  ); // Ensure type match
                  if (event) {
                    openEditDialog(event);
                  }
                }}
                eventResize={handleEventResize}
                eventContent={renderEventContent}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"
                // validRange={{ start: new Date() }}
                timeZone="local"
                nowIndicator={true}
                now={new Date()}
                slotMinTime="09:00:00"
                slotMaxTime="23:00:00"
                slotDuration="00:30:00"
                snapDuration="00:30:00"
                allDaySlot={false}
                eventOverlap={false}
                eventDurationEditable={true}
                viewDidMount={(view) => {
                  const newViewType = view.view.type;
                  setCurrentView(newViewType);
                  fetchEvents(selectedTrack); // Fetch events for the updated view period
                }}
                dayHeaderContent={renderDayHeaderContent}
                eventDrop={handleEventDrop} // Add this prop to handle event dragging
                selectAllow={function (selectInfo) {
                  const start = selectInfo.start;
                  const end = selectInfo.end;
                  // Prevent selection on past dates
                  if (isDateInPast(start)) {
                    return false;
                  }
                  // Allow only if start and end are on the same calendar day and starttime before endtime
                  if (start.getDate() !== end.getDate()) {
                    return false;
                  }
                  if (start.getHours() >= end.getHours()) {
                    return false;
                  } 
   
                  return start.toDateString() === end.toDateString();
                }}
              />
            </Card>
          )}
        </>
      )}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset selectedEvent when dialog closes
            setSelectedEvent(null);
          }
          setIsDialogOpen(open);
        }}
      >
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
                value={selectedEvent ? selectedEvent.title : newEvent.title}
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
                    selectedEvent ? selectedEvent.isOnline : newEvent.isOnline
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
            <Select onValueChange={handleBranchSelection}>
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
      <Dialog open={isLeaveConfirmOpen} onOpenChange={setIsLeaveConfirmOpen}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              {pendingTrackId
                ? "You have unsaved changes. Changing tracks will lose these changes."
                : "You have unsaved changes to the schedule. What would you like to do?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsLeaveConfirmOpen(false);
                setPendingTrackId(null); // Reset pending track ID
              }}
            >
              Cancel
            </Button>
            <div className="space-x-2">
              {!pendingTrackId && (
                <Button
                  onClick={() => {
                    setIsLeaveConfirmOpen(false);
                  }}
                >
                  Stay on Page
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => {
                  setHasUnsavedChanges(false);
                  setIsLeaveConfirmOpen(false);

                  if (pendingTrackId) {
                    // Apply track change if that was the trigger
                    applyTrackChange(pendingTrackId);
                  } else if (navigationPath) {
                    // Navigate away if that was the trigger
                    navigate(navigationPath);
                  }
                }}
              >
                {pendingTrackId ? "Change Track" : "Leave Without Saving"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete
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
          font-size: 1.1rem;
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
