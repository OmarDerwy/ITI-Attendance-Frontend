import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useBeforeUnload } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { Calendar, Loader2, X, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import LeaveConfirmationDialog from "@/components/schedule/LeaveConfirmationDialog";
import EventDialog from "@/components/events/EventDialog";
import EventsBulkCreateUpdate from "@/components/events/EventsBulkCreateUpdate";
import { axiosBackendInstance } from "@/api/config";
import { useUser } from "@/context/UserContext";

const Event = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const calendarRef = useRef(null);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogDocked, setIsDialogDocked] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState("timeGrid4Day");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [navigationPath, setNavigationPath] = useState("");
  const [deletedEventIds, setDeletedEventIds] = useState([]);
  const [deletedEvents, setDeletedEvents] = useState([]);
  const [isSubEvent, setIsSubEvent] = useState(false);
  const [parentEventId, setParentEventId] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState({});
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [tracks, setTracks] = useState([]);
  const [newEvent, setNewEvent] = useState(createDefaultEvent());

  // Helper function to create a default event
  function createDefaultEvent() {
    return {
      id: "react" + uuidv4(),
      title: "",
      description: "",
      start: "",
      end: "",
      parentId: null,
    };
  }

  // Utility functions
  const isDateInPast = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }, []);

  const refreshCalendar = useCallback(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  }, []);

  const isWithinParentBounds = useCallback(
    (event, newStart, newEnd) => {
      if (!event.parentId) return true;

      const parentEvent = events.find(
        (e) => String(e.id) === String(event.parentId)
      );
      if (!parentEvent) return true;

      const parentStart = new Date(parentEvent.start);
      const parentEnd = new Date(parentEvent.end);
      return newStart >= parentStart && newEnd <= parentEnd;
    },
    [events]
  );

  // Track unsaved changes
  useEffect(() => {
    const modifiedEvents = events.filter((event) => event.isModified);
    setHasUnsavedChanges(
      modifiedEvents.length > 0 || deletedEventIds.length > 0
    );
  }, [events, deletedEventIds]);
  // Handle navigation warnings
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

  // API calls
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosBackendInstance.get("events/calendar-data/");

      const fetchedEvents = response?.data?.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        parentId: event.parentId || null,
        audience_type: event.audience_type,
        is_mandatory: event.is_mandatory,
        target_tracks: event.target_tracks,
      }));

      setEvents(fetchedEvents || []);
      setDeletedEventIds([]);
      setDeletedEvents([]);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.warning("No events found");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTracks = useCallback(async () => {
    try {
      const response = await axiosBackendInstance.get("attendance/tracks/");
      setTracks(response?.data || []);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setTracks([]);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchTracks();
    fetchEvents();

    return () => {
      if (calendarRef.current) {
        calendarRef.current.getApi().destroy();
      }
    };
  }, [fetchEvents, fetchTracks]);

  // Event handlers
  const handleEventSubmit = useCallback(() => {
    const eventData = selectedEvent || newEvent;
    const startDate = new Date(eventData.start);
    const endDate = new Date(eventData.end);

    // Validation
    if (!eventData.title) {
      toast.error("Title is required.");
      return;
    }

    if (startDate >= endDate) {
      toast.error("Start time must be before end time.");
      return;
    }

    if (isDateInPast(startDate)) {
      toast.error("Cannot add events to past dates");
      return;
    }

    // Check parent bounds for sub-events
    if (isSubEvent || (selectedEvent && selectedEvent.parentId)) {
      const parentId = isSubEvent ? parentEventId : selectedEvent.parentId;
      const parentEvent = events.find((e) => String(e.id) === String(parentId));

      if (parentEvent) {
        const parentStart = new Date(parentEvent.start);
        const parentEnd = new Date(parentEvent.end);

        if (startDate < parentStart || endDate > parentEnd) {
          toast.error(
            "Sub-events must stay within the time bounds of their parent event"
          );
          return;
        }
      }
    }

    if (!selectedEvent) {
      // Add mode
      const newEventData = {
        id: "react" + uuidv4(),
        title: newEvent.title,
        description: newEvent.description || "",
        start: newEvent.start,
        end: newEvent.end,
        parentId: isSubEvent ? parentEventId : null,
        audience_type: newEvent.audience_type,
        is_mandatory: newEvent.is_mandatory || false,
        target_tracks: newEvent.target_tracks || [],
        isModified: true,
      };

      setEvents((prev) => [...prev, newEventData]);
      toast.success(
        isSubEvent
          ? "Sub-event added successfully. Remember to save changes!"
          : "Event added successfully. Remember to save changes!"
      );
    } else {
      // Edit mode
      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id
            ? { ...selectedEvent, isModified: true }
            : event
        )
      );
      toast.success("Event updated successfully. Remember to save changes!");
    }

    // Reset state
    setIsDialogOpen(false);
    setSelectedEvent(null);
    setIsSubEvent(false);
    setParentEventId(null);
    setNewEvent(createDefaultEvent());
    refreshCalendar();
  }, [
    selectedEvent,
    newEvent,
    events,
    isSubEvent,
    parentEventId,
    isDateInPast,
    refreshCalendar,
  ]);

  const handleDeleteEvent = useCallback(
    (eventId) => {
      const event = events.find((e) => String(e.id) === String(eventId));

      if (event && isDateInPast(event.start)) {
        toast.error("Cannot delete events from past dates");
        return;
      }

      // For new events (not yet saved to backend)
      if (!event || String(event.id).startsWith("react")) {
        // Find and remove all sub-events
        const subEventIds = events
          .filter((e) => e.parentId === eventId)
          .map((e) => e.id);

        setEvents((prev) =>
          prev.filter(
            (e) =>
              String(e.id) !== String(eventId) && !subEventIds.includes(e.id)
          )
        );

        toast.success("Event cancelled.");
        setIsDialogOpen(false);
        return;
      }

      // For existing events
      setDeletedEvents((prev) => [...prev, event]);
      setDeletedEventIds((prev) => [...prev, Number(eventId)]);

      // Handle sub-events
      const subEvents = events.filter((e) => e.parentId === eventId);
      if (subEvents.length > 0) {
        const subEventIds = subEvents
          .map((e) => Number(e.id))
          .filter((id) => !isNaN(id));

        setDeletedEventIds((prev) => [...prev, ...subEventIds]);
        setDeletedEvents((prev) => [...prev, ...subEvents]);
      }

      setEvents((prev) =>
        prev.filter(
          (e) => String(e.id) !== String(eventId) && e.parentId !== eventId
        )
      );

      toast.success("Event marked for deletion. Save changes to confirm.");
      setIsDialogOpen(false);
    },
    [events, isDateInPast]
  );

  const handleEventResize = useCallback(
    (resizeInfo) => {
      const eventId = resizeInfo.event.id;
      const event = events.find((e) => String(e.id) === String(eventId));

      if (isDateInPast(resizeInfo.event.start)) {
        resizeInfo.revert();
        toast.error("Cannot modify events from past dates");
        return;
      }

      const newStart = new Date(resizeInfo.event.start);
      const newEnd = new Date(resizeInfo.event.end);

      // Check parent bounds for sub-events
      if (event && event.parentId) {
        if (!isWithinParentBounds(event, newStart, newEnd)) {
          resizeInfo.revert();
          toast.error(
            "Sub-events must stay within the time bounds of their parent event"
          );
          return;
        }
      }

      setEvents((prev) =>
        prev.map((e) =>
          String(e.id) === String(eventId)
            ? {
                ...e,
                start: resizeInfo.event.startStr,
                end: resizeInfo.event.endStr,
                isModified: true,
              }
            : e
        )
      );
    },
    [events, isDateInPast, isWithinParentBounds]
  );

  const handleEventDrop = useCallback(
    (dropInfo) => {
      const eventId = dropInfo.event.id;
      const event = events.find((e) => String(e.id) === String(eventId));

      if (isDateInPast(dropInfo.event.start)) {
        dropInfo.revert();
        toast.error("Cannot modify events from past dates");
        return;
      }

      const newStart = new Date(dropInfo.event.start);
      const newEnd = new Date(dropInfo.event.end);

      // For sub-events, check parent bounds
      if (event && event.parentId) {
        if (!isWithinParentBounds(event, newStart, newEnd)) {
          dropInfo.revert();
          toast.error(
            "Sub-events must stay within the time bounds of their parent event"
          );
          return;
        }
      }

      // If this is a parent event, also move all sub-events
      const isParent = events.some((e) => e.parentId === eventId);
      if (isParent) {
        const subEvents = events.filter((e) => e.parentId === eventId);
        const timeDiff = newStart - new Date(event.start);

        subEvents.forEach((subEvent) => {
          const newSubStart = new Date(
            new Date(subEvent.start).getTime() + timeDiff
          );
          const newSubEnd = new Date(
            new Date(subEvent.end).getTime() + timeDiff
          );

          setEvents((prev) =>
            prev.map((e) =>
              String(e.id) === String(subEvent.id)
                ? {
                    ...e,
                    start: newSubStart.toISOString(),
                    end: newSubEnd.toISOString(),
                    isModified: true,
                  }
                : e
            )
          );
        });
      }

      setEvents((prev) =>
        prev.map((e) =>
          String(e.id) === String(eventId)
            ? {
                ...e,
                start: dropInfo.event.startStr,
                end: dropInfo.event.endStr,
                isModified: true,
              }
            : e
        )
      );
    },
    [events, isDateInPast, isWithinParentBounds]
  );

  const handleDateClick = useCallback(
    (info) => {
      if (userRole !== "coordinator") return;
      if (isDateInPast(info.date)) {
        toast.error("Cannot add events to past dates");
        return;
      }

      setSelectedEvent(null);
      setIsSubEvent(false);
      setParentEventId(null);

      const startDate = new Date(info.date);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      setNewEvent({
        id: "react" + uuidv4(),
        title: "",
        description: "",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        parentId: null,
        audience_type: "both",
        is_mandatory: false,
        target_tracks: [],
      });

      // Set position from the click event
      if (info.jsEvent) {
        setDialogPosition({ x: info.jsEvent.clientX, y: info.jsEvent.clientY });
      }

      setIsDialogOpen(true);
    },
    [userRole, isDateInPast]
  );

  const handleOpenAddDialog = useCallback(
    (selectInfo) => {
      if (userRole !== "coordinator") return;
      if (isDateInPast(selectInfo.start)) {
        toast.error("Cannot add events to past dates");
        return;
      }

      setSelectedEvent(null);
      setIsSubEvent(false);
      setParentEventId(null);

      setNewEvent({
        id: "react" + uuidv4(),
        title: "",
        description: "",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        parentId: null,
        audience_type: "both",
        is_mandatory: false,
        target_tracks: [],
      });

      // Set position from the selection event
      if (selectInfo.jsEvent) {
        setDialogPosition({
          x: selectInfo.jsEvent.clientX,
          y: selectInfo.jsEvent.clientY,
        });
      }

      setIsDialogOpen(true);
    },
    [userRole, isDateInPast]
  );

  const openEditDialog = useCallback(
    (event, jsEvent) => {
      if (isDateInPast(event.start)) {
        toast.info("Cannot modify events from past dates");
        return;
      }

      setSelectedEvent(event);
      if (jsEvent) {
        setDialogPosition({ x: jsEvent.clientX, y: jsEvent.clientY });
      }
      setIsDialogOpen(true);
    },
    [isDateInPast]
  );

  const toggleEventExpansion = useCallback(
    (eventId) => {
      setExpandedEvents((prev) => ({
        ...prev,
        [eventId]: !prev[eventId],
      }));
      refreshCalendar();
    },
    [refreshCalendar]
  );

  const addSubEvent = useCallback(
    (parentEvent, jsEvent) => {
      if (isDateInPast(parentEvent.start)) {
        toast.error("Cannot add sub-events to past events");
        return;
      }

      setSelectedEvent(null);
      setIsSubEvent(true);
      setParentEventId(parentEvent.id);

      const parentStart = new Date(parentEvent.start);
      const parentEnd = new Date(parentEvent.end);

      // Calculate default sub-event time (centered within parent)
      const duration = parentEnd - parentStart;
      const subEventDuration = Math.min(duration * 0.5, 30 * 60 * 1000); // 30 minutes or half of parent

      const subStart = new Date(
        parentStart.getTime() + (duration - subEventDuration) / 2
      );
      const subEnd = new Date(subStart.getTime() + subEventDuration);

      setNewEvent({
        id: "react" + uuidv4(),
        title: "",
        description: "",
        start: subStart.toISOString(),
        end: subEnd.toISOString(),
        parentId: parentEvent.id,
      });

      // Set position if jsEvent is provided
      if (jsEvent) {
        setDialogPosition({ x: jsEvent.clientX, y: jsEvent.clientY });
      }

      setIsDialogOpen(true);
    },
    [isDateInPast]
  );

  const handleLeaveConfirm = useCallback(() => {
    setHasUnsavedChanges(false);
    setIsLeaveConfirmOpen(false);
    if (navigationPath) {
      navigate(navigationPath);
    }
  }, [navigate, navigationPath]);

  const updateSelectedEvent = useCallback((field, value) => {
    setSelectedEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle dialog state changes
  const handleDialogStateChange = useCallback((open) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset dialog state
      setSelectedEvent(null);
      setIsDialogDocked(false);
      // Force calendar resize after dialog closes
      setTimeout(() => {
        if (calendarRef.current) {
          calendarRef.current.getApi().updateSize();
        }
      }, 350); // Wait for transition to complete
    }
  }, []);

  // Render functions
  const renderEventContent = useCallback(
    (eventInfo) => {
      const isPastEvent = isDateInPast(eventInfo.event.start);
      const eventId = eventInfo.event.id;
      const event = events.find((e) => String(e.id) === String(eventId));

      if (event && event.parentId) {
        return null;
      }

      const hasSubEvents = events.some((e) => e.parentId === eventId);
      const isExpanded = expandedEvents[eventId];
      const subEvents = events.filter((e) => e.parentId === eventId);

      return (
        <div
          className={`flex flex-col justify-between p-1 bg-blue-100 text-blue-800 border-blue-300 rounded w-full h-full ${
            isPastEvent ? "opacity-75" : ""
          } border`}
        >
          <div className="flex justify-between mb-1">
            {hasSubEvents ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEventExpansion(eventId);
                }}
                className="hover:bg-blue-200 rounded p-0.5"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ) : (
              <div></div> // Empty div to maintain layout
            )}

            {!isPastEvent && userRole === "coordinator" && (
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addSubEvent(event, e);
                  }}
                  className="hover:bg-blue-200 rounded p-0.5"
                  title="Add Sub-Event"
                >
                  +
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(eventId);
                  }}
                  className="hover:bg-blue-200 rounded p-0.5"
                  title="Delete"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col min-h-0">
            <div className="font-medium overflow-hidden text-ellipsis">
              {eventInfo.event.title}
            </div>
            {currentView !== "dayGridMonth" &&
              currentView !== "multiMonthYear" && (
                <div className="text-xs truncate mt-1">
                  {eventInfo.timeText}
                </div>
              )}

            {/* Render sub-events if expanded */}
            {isExpanded && hasSubEvents && (
              <div className="mt-2 border-t border-blue-200 pt-1">
                <div className="text-xs font-medium mb-1">Sub-events:</div>
                {subEvents.map((subEvent) => (
                  <div
                    key={subEvent.id}
                    className="text-xs p-1 mb-1 bg-blue-50 rounded border border-blue-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(subEvent, e);
                    }}
                  >
                    <div className="font-medium truncate">{subEvent.title}</div>
                    <div className="text-xs opacity-80">
                      {new Date(subEvent.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {new Date(subEvent.end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    },
    [
      events,
      currentView,
      isDateInPast,
      userRole,
      expandedEvents,
      openEditDialog,
      addSubEvent,
      handleDeleteEvent,
      toggleEventExpansion,
    ]
  );

  const renderCalendar = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      );
    }

    return (
      <Card className="h-full overflow-auto p-6 bg-background border shadow-lg">
        <div className="mb-4 flex flex-col md:flex-row items-center gap-4 md:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Event Calendar</h2>
          </div>

          {userRole === "coordinator" && hasUnsavedChanges && (
            <EventsBulkCreateUpdate
              events={events}
              deletedEventIds={deletedEventIds}
              deletedEvents={deletedEvents}
              onSaveSuccess={() => {
                setHasUnsavedChanges(false);
                setDeletedEventIds([]);
                setDeletedEvents([]);
                setEvents((prev) =>
                  prev.map((event) => ({ ...event, isModified: false }))
                );
                refreshCalendar();
              }}
            />
          )}
        </div>
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            multiMonthPlugin,
          ]}
          initialView="timeGrid4Day"
          views={{
            timeGrid4Day: {
              type: "timeGrid",
              duration: { days: 4 },
              buttonText: "4 days",
            },
          }}
          selectable={userRole === "coordinator"}
          editable={userRole === "coordinator"}
          select={handleOpenAddDialog}
          dateClick={handleDateClick}
          events={events.filter((event) => !event.parentId)}
          eventClick={(info) => {
            const event = events.find(
              (e) => String(e.id) === String(info.event.id)
            );
            if (event) openEditDialog(event, info.jsEvent);
          }}
          eventResize={handleEventResize}
          eventContent={renderEventContent}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "multiMonthYear,dayGridMonth,timeGrid4Day",
          }}
          height="100%"
          timeZone="local"
          nowIndicator={true}
          now={new Date()}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          allDaySlot={false}
          eventOverlap={true}
          eventDurationEditable={true}
          onViewChange={(view) => {
            setCurrentView(view.view.type);
            setTimeout(() => {
              if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
              }
            }, 50);
          }}
          viewDidMount={(view) => {
            setCurrentView(view.view.type);
            // Force a resize after the view changes
            setTimeout(() => {
              if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
              }
            }, 50);
            // close the dialog when the view changes
            if (isDialogDocked ) {
              closeAddEventDialog();
            }
          }}
          windowResize={() => {
            if (calendarRef.current) {
              calendarRef.current.getApi().updateSize();
            }
          }}
          eventDrop={handleEventDrop}
          selectAllow={(info) => !isDateInPast(info.start)}
          firstDay={1}
        />
      </Card>
    );
  }, [
    isLoading,
    events,
    userRole,
    hasUnsavedChanges,
    deletedEventIds,
    deletedEvents,
    refreshCalendar,
    handleOpenAddDialog,
    handleDateClick,
    handleEventResize,
    renderEventContent,
    handleEventDrop,
    isDateInPast,
    openEditDialog,
  ]);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
        <div
          className="calendar-container transition-all duration-300 ease-in-out w-full"
          style={{
            marginRight: isDialogDocked ? "450px" : "0",
            width: "100%",
            overflowX: "auto", // Add horizontal scrolling capability
          }}
        >
          {renderCalendar()}
        </div>
        <EventDialog
          isOpen={isDialogOpen}
          onOpenChange={handleDialogStateChange}
          selectedEvent={selectedEvent}
          newEvent={newEvent}
          onEventUpdate={updateSelectedEvent}
          onNewEventChange={setNewEvent}
          onSubmit={handleEventSubmit}
          onDelete={handleDeleteEvent}
          parentEvent={
            isSubEvent || (selectedEvent && selectedEvent.parentId)
              ? events.find(
                  (e) =>
                    String(e.id) ===
                    String(isSubEvent ? parentEventId : selectedEvent.parentId)
                )
              : null
          }
          tracks={tracks}
          position={dialogPosition}
          onDockStateChange={(docked) => {
            setIsDialogDocked(docked);
            // Force calendar resize after state change
            setTimeout(() => {
              if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
              }
            }, 350); // Wait for transition to complete
          }}
        />
        <LeaveConfirmationDialog
          isOpen={isLeaveConfirmOpen}
          onOpenChange={setIsLeaveConfirmOpen}
          onCancel={() => setIsLeaveConfirmOpen(false)}
          onStay={() => setIsLeaveConfirmOpen(false)}
          onLeave={handleLeaveConfirm}
        />
      </div>
    </Layout>
  );
};

export default Event;
