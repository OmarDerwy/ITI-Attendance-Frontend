import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "@/components/layout/Layout";
import {
  MapPin,
  X,
  MapPinned,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import TrackDropdown from "@/components/schedule/TrackDropdown";
import SessionsBulkCreateUpdate from "@/components/schedule/SessionsBulkCreateUpdate";
import { axiosBackendInstance } from "@/api/config";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useBeforeUnload } from "react-router-dom";
import { toast } from "sonner";
import EventDialog from '../../components/schedule/EventDialog';
import BranchSelectionDialog from '../../components/schedule/BranchSelectionDialog';
import LeaveConfirmationDialog from '../../components/schedule/LeaveConfirmationDialog';

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [pendingTrackId, setPendingTrackId] = useState(null);
  const [navigationPath, setNavigationPath] = useState("");
  const [deletedEventIds, setDeletedEventIds] = useState([]);
  const [deletedEvents, setDeletedEvents] = useState([]);

  // Filter events to only show those for the selected track
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
  const modifiedEvents = events.filter((event) => event.isModified);
  
  useEffect(() => {
    setHasUnsavedChanges(modifiedEvents.length > 0 || deletedEventIds.length > 0);
  }, [modifiedEvents.length, deletedEventIds.length]);

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
      setIsLoading(true);
      const response = await axiosBackendInstance.get(
        `attendance/sessions/calendar-data/?track_id=${trackId}`
      );
      const fetchedEvents = response?.data?.map((event) => ({
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
      }));
      
      // Replace all events with the newly fetched ones for this track
      setEvents(fetchedEvents);
      
      // Clear any deleted events since we're loading fresh data
      setDeletedEventIds([]);
      setDeletedEvents([]);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.warning("No sessions found for the given track");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackChange = (trackId) => {
    if (hasUnsavedChanges) {
      setPendingTrackId(trackId);
      setIsLeaveConfirmOpen(true);
    } else {
      applyTrackChange(trackId);
    }
  };

  const applyTrackChange = (trackId) => {
    updateTrackAndBranch(trackId, tracks);
    fetchEvents(trackId);
    setPendingTrackId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchesResponse = await axiosBackendInstance.get(
          "attendance/branches/"
        );
        setFetchedBranches(branchesResponse.data);
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
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data");
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
    const startDate = new Date(
      selectedEvent ? selectedEvent.start : newEvent.start
    );
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
    // Only check against events from the current track
    const isOverlapping = filteredEvents.some((event) => {
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
        toast.error("Title is required.");
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

  // Function to handle direct deletion without confirmation
  const handleDeleteEvent = (eventId) => {
    const event = events.find((e) => String(e.id) === String(eventId));

    // Check if event is in the past
    if (event && isDateInPast(event.start)) {
      toast.error("Cannot delete sessions from past dates");
      return;
    }

    // If the event is not saved (no schedule_id), remove it locally
    if (!event || String(event.id).startsWith("react")) {
      setEvents((prev) =>
        prev.filter((e) => String(e.id) !== String(eventId))
      );
      toast.success("Event cancelled.");
      setIsDialogOpen(false);
      return;
    }

    // Store the event details before removing it
    setDeletedEvents(prev => [...prev, event]);
    
    // Add to deletedEventIds for bulk deletion
    setDeletedEventIds(prev => [...prev, Number(eventId)]);
    
    // Remove from events array
    setEvents((prev) =>
      prev.filter((e) => String(e.id) !== String(eventId))
    );
    
    setHasUnsavedChanges(true);
    toast.success("Event marked for deletion. Save changes to confirm.");
    setIsDialogOpen(false);
  };

  // Function to handle leave confirmation
  const handleLeaveConfirm = () => {
    setHasUnsavedChanges(false);
    setIsLeaveConfirmOpen(false);

    if (pendingTrackId) {
      // Apply track change if that was the trigger
      applyTrackChange(pendingTrackId);
    } else if (navigationPath) {
      // Navigate away if that was the trigger
      navigate(navigationPath);
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
    }));
  };

  const toggleEventType = (e, eventId) => {
    e.stopPropagation();

    // First check if event is in the past
    const event = events.find((e) => String(e.id) === String(eventId));
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

  // Function to handle save success
  const handleSaveSuccess = async () => {
    try {
      // Show a subtle loading indicator if needed
      setIsLoading(true);
      
      // Fetch fresh events for the current track
      await fetchEvents(selectedTrack);
      
      // Reset all modified flags and deleted events
      setDeletedEventIds([]);
      setDeletedEvents([]);
      setHasUnsavedChanges(false);
      
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error refreshing events:", error);
      toast.error("Failed to refresh events");
    } finally {
      setIsLoading(false);
    }
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
    // Only check events from the current track
    const eventsOnSameDay = filteredEvents.filter((event) => {
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
      trackId: selectedTrack, // Ensure the new event has the current track ID
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
    const isPastEvent = isDateInPast(eventInfo.event.start);

    // Apply the correct CSS classes based on online/offline status
    const eventClassName = isOnline ? "event-online" : "event-offline";
    const textClassName = isOnline ? "event-online-text" : "event-offline-text";
    const branchClassName = isOnline
      ? "event-branch-online"
      : "event-branch-offline";

    // Safely apply classes to the event element if it exists
    if (eventInfo.el) {
      eventInfo.el.classList.add(eventClassName);
    }

    return (
      <div
        className={`flex flex-col justify-between p-1 ${textClassName} rounded w-full h-full ${
          isPastEvent ? "opacity-75" : ""
        }`}
      >
        {/* Top section with controls */}
        {!isPastEvent && (
          <div className="flex justify-end space-x-1 mb-1">
            <button
              onClick={(e) => {
                e.preventDefault(); // Ensure event doesn't bubble
                toggleEventType(e, eventInfo.event.id);
              }}
              className={`${textClassName} hover:opacity-80 flex items-center justify-center`}
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
                handleDeleteEvent(eventInfo.event.id);
              }}
              className={`${textClassName} hover:opacity-80`}
              title="Delete"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex-grow flex flex-col min-h-0">
          <div className="overflow-hidden text-ellipsis">
            {eventInfo.event.title}
          </div>
          <div className={`text-xs ${branchClassName} truncate mt-1`}>
            {eventInfo.event.extendedProps.instructor || ""}
          </div>
        </div>

        {/* Bottom section with branch info - moved to absolute bottom */}
        {currentView !== "dayGridMonth" && (
          <div
            className={`flex items-center text-xs italic mt-auto ${branchClassName}`}
          >
            {isOnline ? (
              <>
                <MapPin size={12} className="flex-shrink-0 mr-1" />
                <span className="truncate">Home</span>
              </>
            ) : (
              <>
                <MapPin size={12} className="flex-shrink-0 mr-1" />
                <span className="truncate max-w-[calc(100%-20px)]">
                  {eventInfo.event.extendedProps.branch?.name}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDayHeaderContent = (headerInfo) => {
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
        if (eventDate === selectedDayString && !event.isOnline && event.trackId === selectedTrack) {
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
          {tracks.length === 0 ? (
            <p className="text-gray-500 text-center">No tracks assigned.</p>
          ) : (
            <Card className="p-6 bg-background border shadow-lg">
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
                      events={[...events.filter((event) => event.isModified && event.trackId === selectedTrack)]}
                      deletedEventIds={deletedEventIds}
                      deletedEvents={deletedEvents}
                      onSaveSuccess={handleSaveSuccess}
                    />
                  </div>
                )}
              </div>
              <FullCalendar
                eventClassNames={(info) => {
                  return [
                    info.event.extendedProps.isOnline
                      ? "event-online"
                      : "event-offline",
                  ];
                }}
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
      <EventDialog 
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset selectedEvent when dialog closes
            setSelectedEvent(null);
          }
          setIsDialogOpen(open);
        }}
        selectedEvent={selectedEvent}
        newEvent={newEvent}
        onEventUpdate={updateSelectedEvent}
        onNewEventChange={setNewEvent}
        onSubmit={handleEventSubmit}
        onDelete={handleDeleteEvent}
      />
      <BranchSelectionDialog 
        isOpen={isBranchModalOpen}
        onOpenChange={setIsBranchModalOpen}
        selectedDay={selectedDay}
        branches={branches}
        onBranchSelection={handleBranchSelection}
      />
      <LeaveConfirmationDialog 
        isOpen={isLeaveConfirmOpen}
        onOpenChange={setIsLeaveConfirmOpen}
        pendingTrackId={pendingTrackId}
        onCancel={() => {
          setIsLeaveConfirmOpen(false);
          setPendingTrackId(null);
        }}
        onStay={() => setIsLeaveConfirmOpen(false)}
        onLeave={handleLeaveConfirm}
      />
    </Layout>
  );
};

export default Schedule;