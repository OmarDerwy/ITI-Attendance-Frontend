import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useBeforeUnload } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { Calendar, Loader2, X, ChevronDown, ChevronRight, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import LeaveConfirmationDialog from "@/components/schedule/LeaveConfirmationDialog";
import EventDialog from "@/components/events/EventDialog";
import { axiosBackendInstance } from "@/api/config";
import { useUser } from "@/context/UserContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

class EventManager {
  constructor(events = []) {
    this.events = events;
  }

  findEvent(eventId) {
    return this.events.find((e) => String(e.id) === String(eventId));
  }

  updateEvent(eventId, updates) {
    this.events = this.events.map((event) =>
      event.id === eventId ? { ...event, ...updates } : event
    );
    return this.events;
  }

  deleteEvent(eventId) {
    this.events = this.events.filter((event) => event.id !== eventId);
    return this.events;
  }

  addEvent(event) {
    this.events = [...this.events, event];
    return this.events;
  }

  updateSession(eventId, sessionId, updates) {
    this.events = this.events.map((event) => {
      if (event.id === eventId) {
        return {
          ...event,
          sessions: event.sessions.map((session) =>
            session.id === sessionId ? { ...session, ...updates } : session
          ),
        };
      }
      return event;
    });
    return this.events;
  }

  deleteSession(eventId, sessionId) {
    this.events = this.events.map((event) => {
      if (event.id === eventId) {
        return {
          ...event,
          sessions: event.sessions.filter((session) => session.id !== sessionId),
        };
      }
      return event;
    });
    return this.events;
  }
}

const Event = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const calendarRef = useRef(null);
  const [eventManager] = useState(() => new EventManager());
  const [expandedEvents, setExpandedEvents] = useState({});

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogDocked, setIsDialogDocked] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState("timeGrid4Day");
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [navigationPath, setNavigationPath] = useState("");
  const [isSubEvent, setIsSubEvent] = useState(false);
  const [parentEventId, setParentEventId] = useState(null);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [tracks, setTracks] = useState([]);
  const [newEvent, setNewEvent] = useState(createDefaultEvent());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isResizeConfirmOpen, setIsResizeConfirmOpen] = useState(false);
  const [isMoveConfirmOpen, setIsMoveConfirmOpen] = useState(false);
  const [pendingEventChanges, setPendingEventChanges] = useState(null);

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
  // API calls
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosBackendInstance.get("/attendance/events");
      console.log("Raw API response:", response?.data);
      
      const fetchedEvents = response?.data?.map((event) => {
        // Get the first and last session times
        const firstSession = event.sessions?.[0];
        const lastSession = event.sessions?.[event.sessions.length - 1];
        
        // Format dates for FullCalendar
        const start = firstSession ? new Date(firstSession.start_time).toISOString() : null;
        const end = lastSession ? new Date(lastSession.end_time).toISOString() : null;

        const transformedEvent = {
          id: event.id,
          title: event.title,
          description: event.description,
          start: start,
          end: end,
          audience_type: event.audience_type,
          is_mandatory: event.is_mandatory,
          target_tracks: event.target_tracks.map(track => track.id),
          branch: event.branch,
          branch_name: event.branch_name,
          sessions: event.sessions.map(session => ({
            ...session,
            start_time: new Date(session.start_time).toISOString(),
            end_time: new Date(session.end_time).toISOString()
          }))
        };
        console.log("Transformed event:", transformedEvent);
        return transformedEvent;
      });

      setEvents(fetchedEvents || []);
      eventManager.events = fetchedEvents || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.warning("No events found");
      setEvents([]);
      eventManager.events = [];
    } finally {
      setIsLoading(false);
    }
  }, [eventManager]);

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
  const handleEventSubmit = useCallback(async () => {
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

    if (!eventData.sessions || eventData.sessions.length === 0) {
      toast.error("At least one session is required.");
      return;
    }

    try {
      const eventPayload = {
        title: eventData.title,
        description: eventData.description || "",
        event_date: startDate.toISOString().split('T')[0],
        audience_type: eventData.audience_type,
        is_mandatory: eventData.is_mandatory || false,
        target_track_ids: eventData.target_tracks || [],
        sessions: eventData.sessions.map(session => {
          // Ensure we have valid date objects
          const startTime = new Date(session.start_time || session.start);
          const endTime = new Date(session.end_time || session.end);

          // Validate dates
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error('Invalid date values in session');
          }

          return {
            id: session.id,
            title: session.title,
            speaker: session.speaker || "",
            start_time: startTime.toISOString(), // Send as ISO string
            end_time: endTime.toISOString(), // Send as ISO string
            session_type: "offline"
          };
        })
      };

      let response;
      if (!selectedEvent) {
        // Add new event
        response = await axiosBackendInstance.post("/attendance/events/", eventPayload);
        const newEventData = {
          ...eventData,
          id: response.data.id,
          sessions: eventData.sessions.map(session => ({
            ...session,
            parentId: response.data.id
          }))
        };
        setEvents(prev => [...prev, newEventData]);
        toast.success("Event added successfully!");
      } else {
        // Update event (including sessions)
        response = await axiosBackendInstance.put(`/attendance/events/${selectedEvent.id}`, eventPayload);
        
        // Update the events state with the modified event and sessions
        setEvents(prev =>
          prev.map(event =>
            event.id === selectedEvent.id
              ? {
                  ...selectedEvent,
                  ...response.data,
                  sessions: response.data.sessions.map(session => ({
                    ...session,
                    parentId: selectedEvent.id
                  }))
                }
              : event
          )
        );
        toast.success("Event updated successfully!");
      }

      // Reset state and refresh
      setIsDialogOpen(false);
      setSelectedEvent(null);
      setIsSubEvent(false);
      setParentEventId(null);
      setNewEvent(createDefaultEvent());
      await fetchEvents();
      
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        setTimeout(() => calendarApi.updateSize(), 100);
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(error.response?.data?.message || "Failed to save event. Please try again.");
    }
  }, [selectedEvent, newEvent, isSubEvent, parentEventId, isDateInPast, fetchEvents]);

  const handleDeleteEvent = useCallback(async (eventId) => {
    const event = events.find(e => String(e.id) === String(eventId));

    if (event && isDateInPast(event.start)) {
      toast.error("Cannot delete events from past dates");
      return;
    }

    try {
      if (!event || String(event.id).startsWith("react")) {
        setEvents(prev => prev.filter(e => String(e.id) !== String(eventId) && e.parentId !== eventId));
        toast.success("Event cancelled.");
        setIsDialogOpen(false);
        return;
      }

      // Delete event (this will also delete all associated sessions)
      await axiosBackendInstance.delete(`/attendance/events/${eventId}`);
      setEvents(prev => prev.filter(e => String(e.id) !== String(eventId) && e.parentId !== eventId));
      toast.success("Event deleted successfully!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event. Please try again.");
    }
  }, [events, isDateInPast]);

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

      // Show confirmation dialog
      setPendingEventChanges({
        type: 'resize',
        eventId,
        newStart,
        newEnd,
        revert: resizeInfo.revert
      });
      setIsResizeConfirmOpen(true);
    },
    [events, isDateInPast]
  );

  const handleEventDrop = useCallback(
    (dropInfo) => {
      const eventId = dropInfo.event.id;
      const event = events.find((e) => String(e.id) === String(eventId));

      if (isDateInPast(dropInfo.event.start)) {
        dropInfo.revhandleEventDropert();
        toast.error("Cannot modify events from past dates");
        return;
      }

      const newStart = new Date(dropInfo.event.start);
      const newEnd = new Date(dropInfo.event.end);

      // Show confirmation dialog
      setPendingEventChanges({
        type: 'move',
        eventId,
        newStart,
        newEnd,
        revert: dropInfo.revert
      });
      setIsMoveConfirmOpen(true);
    },
    [events, isDateInPast]
  );

  const handleConfirmChanges = useCallback(async () => {
    if (!pendingEventChanges) return;

    const { type, eventId, newStart, newEnd } = pendingEventChanges;
    const event = events.find(e => String(e.id) === String(eventId));

    try {
      if (type === 'resize' || type === 'move') {
        const updatedEvent = {
          ...event,
          event_date: newStart.toISOString().split('T')[0],
          sessions: event.sessions.map((session, index) => {
            const sessionStart = new Date(session.start_time);
            const sessionEnd = new Date(session.end_time);
            const timeDiff = newStart - new Date(event.start);
            
            // For resize operation, adjust the last session's end time to match the new event end time
            if (type === 'resize' && index === event.sessions.length - 1) {
              return {
                ...session,
                start_time: new Date(sessionStart.getTime() + timeDiff).toISOString(),
                end_time: newEnd.toISOString()
              };
            }
            
            return {
              ...session,
              start_time: new Date(sessionStart.getTime() + timeDiff).toISOString(),
              end_time: new Date(sessionEnd.getTime() + timeDiff).toISOString()
            };
          })
        };

        const response = await axiosBackendInstance.put(`/attendance/events/${eventId}`, updatedEvent);
        setEvents(prev =>
          prev.map(e =>
            String(e.id) === String(eventId)
              ? {
                  ...e,
                  ...response.data,
                  sessions: response.data.sessions.map(session => ({
                    ...session,
                    parentId: eventId
                  }))
                }
              : e
          )
        );
        toast.success("Event updated successfully!");
        // Reload events after successful update
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
      pendingEventChanges.revert();
    } finally {
      setPendingEventChanges(null);
      setIsResizeConfirmOpen(false);
      setIsMoveConfirmOpen(false);
    }
  }, [pendingEventChanges, events, fetchEvents]);

  const handleCancelChanges = useCallback(() => {
    if (pendingEventChanges) {
      pendingEventChanges.revert();
      setPendingEventChanges(null);
    }
    setIsResizeConfirmOpen(false);
    setIsMoveConfirmOpen(false);
  }, [pendingEventChanges]);


  const handleDateClick = useCallback((info) => {
    if (userRole !== "coordinator" || isDateInPast(info.date)) {
      toast.error("Cannot add events to past dates");
      return;
    }

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

    setSelectedEvent(null);
    setIsSubEvent(false);
    setParentEventId(null);
    setDialogPosition(info.jsEvent ? { x: info.jsEvent.clientX, y: info.jsEvent.clientY } : { x: 0, y: 0 });
    setIsDialogOpen(true);
  }, [userRole, isDateInPast]);

  const handleOpenAddDialog = useCallback((selectInfo) => {
    if (userRole !== "coordinator" || isDateInPast(selectInfo.start)) {
      toast.error("Cannot add events to past dates");
      return;
    }

    if (selectInfo.start.toDateString() !== selectInfo.end.toDateString()) {
      toast.error("Events must be on the same day");
      return;
    }

    setNewEvent({
      id: "react" + uuidv4(),
      title: "",
      description: "",
      start: selectInfo.start.toISOString(),
      end: selectInfo.end.toISOString(),
      parentId: null,
      audience_type: "both",
      is_mandatory: false,
      target_tracks: [],
    });

    setSelectedEvent(null);
    setIsSubEvent(false);
    setParentEventId(null);
    setDialogPosition(selectInfo.jsEvent ? { x: selectInfo.jsEvent.clientX, y: selectInfo.jsEvent.clientY } : { x: 0, y: 0 });
    setIsDialogOpen(true);
  }, [userRole, isDateInPast]);

  const openEditDialog = useCallback((event, jsEvent) => {
    setSelectedEvent({ ...event, isPastEvent: isDateInPast(event.start) });
    setDialogPosition(jsEvent ? { x: jsEvent.clientX, y: jsEvent.clientY } : { x: 0, y: 0 });
    setIsDialogOpen(true);
  }, [isDateInPast]);

  const toggleEventExpansion = useCallback((eventId) => {
    setExpandedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
    refreshCalendar();
  }, [refreshCalendar]);

  const addSubEvent = useCallback((parentEvent, jsEvent) => {
    if (isDateInPast(parentEvent.start)) {
      toast.error("Cannot add sub-events to past events");
      return;
    }

    const parentStart = new Date(parentEvent.start);
    const parentEnd = new Date(parentEvent.end);
    const duration = parentEnd - parentStart;
    const subEventDuration = Math.min(duration * 0.5, 30 * 60 * 1000);
    const subStart = new Date(parentStart.getTime() + (duration - subEventDuration) / 2);
    const subEnd = new Date(subStart.getTime() + subEventDuration);

    setNewEvent({
      id: "react" + uuidv4(),
      title: "",
      description: "",
      start: subStart.toISOString(),
      end: subEnd.toISOString(),
      parentId: parentEvent.id,
    });

    setSelectedEvent(null);
    setIsSubEvent(true);
    setParentEventId(parentEvent.id);
    setDialogPosition(jsEvent ? { x: jsEvent.clientX, y: jsEvent.clientY } : { x: 0, y: 0 });
    setIsDialogOpen(true);
  }, [isDateInPast]);

  const handleLeaveConfirm = useCallback(() => {
    setIsLeaveConfirmOpen(false);
    if (navigationPath) {
      navigate(navigationPath);
    }
  }, [navigate, navigationPath]);

  const updateSelectedEvent = useCallback((field, value) => {
    setSelectedEvent(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle dialog state changes
  const handleDialogStateChange = useCallback((open) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedEvent(null);
      setIsDialogDocked(false);
      setTimeout(() => {
        if (calendarRef.current) {
          calendarRef.current.getApi().updateSize();
        }
      }, 350);
    }
  }, []);

  // Render functions
  const renderEventContent = useCallback(
    (eventInfo) => {
      const isPastEvent = isDateInPast(eventInfo.event.start);
      const eventId = eventInfo.event.id;
      const event = eventManager.findEvent(eventId);
      const isExpanded = expandedEvents[eventId];

      if (!event) return null;

      return (
        <div
          className={`flex flex-col justify-between p-1 event-special border-primary/20 rounded w-full h-full ${
            isPastEvent ? "opacity-75" : ""
          } border`}
        >
          <div className="flex justify-between mb-1">
            {event.sessions.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEventExpansion(eventId);
                }}
                className="hover:bg-primary/20 rounded p-0.5 event-special-text"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}

            {!isPastEvent && userRole === "coordinator" && (
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="hover:bg-primary/20 rounded p-0.5 event-special-text"
                  title="Delete"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col min-h-0">
            <div className="font-medium overflow-hidden text-ellipsis event-special-text">
              {eventInfo.event.title}
            </div>
            {currentView !== "dayGridMonth" &&
              currentView !== "multiMonthYear" && (
                <div className="text-xs truncate mt-1 event-special-text">
                  {eventInfo.timeText}
                </div>
              )}

            {/* Render sessions if expanded */}
            {isExpanded && event.sessions.length > 0 && (
              <div className="mt-2 border-t border-primary/20 pt-1">
                <div className="text-xs font-medium mb-1 event-special-text">
                  Sessions:
                </div>
                {event.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="text-xs p-1 mb-1 bg-primary/20 rounded border border-primary/60 cursor-pointer hover:bg-primary/30 transition-colors event-special-text"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(event, e);
                    }}
                  >
                    <div className="font-medium truncate">{session.title}</div>
                    <div className="text-xs opacity-80">
                      {new Date(session.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {new Date(session.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {session.speaker && (
                        <span className="ml-2">• {session.speaker}</span>
                      )}
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
      toggleEventExpansion,
    ]
  );

  const renderCalendar = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin event-offline-text mb-4" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      );
    }

    return (
      <Card className="h-full overflow-auto p-6 bg-background border shadow-lg">
        <div className="mb-4 flex flex-col md:flex-row items-center gap-4 md:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 event-offline-text" />
            <h2 className="text-xl font-semibold">Event Calendar</h2>
          </div>
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
          eventClassNames={(info) => {
            return ["event-special"];
          }}
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
            if (isDialogDocked) {
              closeAddEventDialog();
            }
          }}
          windowResize={() => {
            if (calendarRef.current) {
              calendarRef.current.getApi().updateSize();
            }
          }}
          eventDrop={handleEventDrop}
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
          firstDay={1}
        />
      </Card>
    );
  }, [
    isLoading,
    events,
    userRole,
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
            setTimeout(() => {
              if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
              }
            }, 350);
          }}
        />
        <LeaveConfirmationDialog
          isOpen={isLeaveConfirmOpen}
          onOpenChange={setIsLeaveConfirmOpen}
          onCancel={() => setIsLeaveConfirmOpen(false)}
          onStay={() => setIsLeaveConfirmOpen(false)}
          onLeave={handleLeaveConfirm}
        />
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteEvent(selectedEvent?.id);
                  setIsDeleteConfirmOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Resize Confirmation Dialog */}
        <Dialog open={isResizeConfirmOpen} onOpenChange={setIsResizeConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resize Event</DialogTitle>
              <DialogDescription>
                Do you want to save the changes to this event's duration?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelChanges}>
                Cancel
              </Button>
              <Button onClick={handleConfirmChanges}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Move Confirmation Dialog */}
        <Dialog open={isMoveConfirmOpen} onOpenChange={setIsMoveConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move Event</DialogTitle>
              <DialogDescription>
                Do you want to save the changes to this event's time?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelChanges}>
                Cancel
              </Button>
              <Button onClick={handleConfirmChanges}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Event;
