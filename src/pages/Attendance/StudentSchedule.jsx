import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list"; // Added for list view
import Layout from "@/components/layout/Layout";
import { Calendar, MapPin, BookOpen, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { axiosBackendInstance } from "@/api/config";
import { format, isToday, isFuture, isPast } from "date-fns";

const StudentSchedule = () => {
  const { studentTrack, setStudentTrack } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const { toast } = useToast();

  // Color variables with dark mode variants
  const onlineForeground = "rgb(254, 230, 231)"; // Light red for light mode (unchanged)
  const onlineForegroundDark = "#4C1B1B"; // Darker specific red for dark mode
  const offlineForeground = "hsl(var(--primary))";
  const offlineForegroundDark = "rgb(127, 0, 0)";
  const offlineTextClass = "text-primary-foreground";
  const onlineTextClass = "text-accent-foreground dark:text-red-100";

  // Function to determine whether to use dark mode colors
  const isDarkMode = () => {
    return document.documentElement.classList.contains("dark");
  };

  useEffect(() => {
    if (studentTrack) {
      fetchEvents(studentTrack.track.id);
    } else {
      setIsLoading(false);
      // toast({
      //   title: "No track found",
      //   description: "You are not assigned to any track.",
      //   variant: "destructive",
      // });
    }
  }, [studentTrack, toast]);

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
        branch: event.branch,
        backgroundColor: event.is_online
          ? isDarkMode()
            ? onlineForegroundDark
            : onlineForeground
          : isDarkMode()
          ? offlineForegroundDark
          : offlineForeground,
        borderColor: event.is_online
          ? isDarkMode()
            ? onlineForegroundDark
            : onlineForeground
          : isDarkMode()
          ? offlineForegroundDark
          : offlineForeground,
        textColor: event.is_online ? onlineTextClass : offlineTextClass,
        // Store original colors to handle theme changes
        originalColors: {
          isOnline: event.is_online,
          light: {
            bg: event.is_online ? onlineForeground : offlineForeground,
          },
          dark: {
            bg: event.is_online ? onlineForegroundDark : offlineForegroundDark,
          },
        },
      }));

      setEvents(fetchedEvents);
      setIsLoading(false);
    } catch (error) {
      // console.error("Error fetching events:", error);
      setIsLoading(false);
      // toast({
      //   title: "Error",
      //   description: "Failed to fetch your schedule. Please try again later.",
      //   variant: "destructive",
      // });
    }
  };

  // Effect to update colors when theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      if (!calendarRef.current) return;

      const api = calendarRef.current.getApi();
      events.forEach((event) => {
        const isDark = isDarkMode();
        const eventObj = api.getEventById(event.id);
        if (eventObj) {
          eventObj.setProp(
            "backgroundColor",
            event.isOnline
              ? isDark
                ? onlineForegroundDark
                : onlineForeground
              : isDark
              ? offlineForegroundDark
              : offlineForeground
          );
          eventObj.setProp(
            "borderColor",
            event.isOnline
              ? isDark
                ? onlineForegroundDark
                : onlineForeground
              : isDark
              ? offlineForegroundDark
              : offlineForeground
          );
        }
      });
    };

    // Listen for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          handleThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [
    events,
    onlineForeground,
    onlineForegroundDark,
    offlineForeground,
    offlineForegroundDark,
  ]);

  const renderEventContent = (eventInfo) => {
    const isOnline = Boolean(eventInfo.event.extendedProps.isOnline);
    const isDark = isDarkMode();
    const textColor = isOnline ? onlineTextClass : offlineTextClass;

    // Theme-aware colors for instructor name
    const subtextColor = isOnline
      ? "text-gray-700 dark:text-red-300"
      : "text-primary-foreground/80 dark:text-primary-foreground/90";

    // Theme-aware colors for branch location
    const branchColor = isOnline
      ? "text-gray-700 dark:text-red-300"
      : "text-primary-foreground/90 dark:text-primary-foreground";

    // Check if we're in list view
    const isListView = ["listDay", "listWeek", "listMonth"].includes(
      currentView
    );

    return (
      <div
        className={`flex items-center p-1 ${textColor} rounded w-full h-full`}
        style={{
          backgroundColor: isOnline
            ? isDark
              ? onlineForegroundDark
              : onlineForeground
            : isDark
            ? offlineForegroundDark
            : offlineForeground,
        }}
      >
        {!isListView && currentView !== "dayGridMonth" && (
          <div
            className={`flex space-x-1 absolute left-1 bottom-1 items-center text-xs italic ${branchColor}`}
          >
            {isOnline ? (
              <>
                <MapPin size={12} className="mr-1" />
                <span className="text-[12px]">Home</span>
              </>
            ) : (
              <>
                <MapPin size={12} className="mr-1" />
                <span className="text-[12px]">
                  {eventInfo.event.extendedProps.branch?.name}
                </span>
              </>
            )}
          </div>
        )}
        <div className="p-1 flex-col w-full">
          <div className="whitespace-normal pr-6 truncate-multiline">
            {eventInfo.event.title}
          </div>
          <div
            className={`text-xs ${subtextColor} flex items-center justify-between`}
          >
            <span>{eventInfo.event.extendedProps.instructor || ""}</span>
            {isListView && (
              <span className="flex items-center ml-2">
                <MapPin size={12} className="mr-1" />
                {isOnline ? "Home" : eventInfo.event.extendedProps.branch?.name}
              </span>
            )}
          </div>
        </div>
      </div>
    );
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
            title="My Schedule"
            subtitle={
              studentTrack
                ? `Track: ${studentTrack.track.name}`
                : "View your class schedule"
            }
            icon={<Calendar className="text-primary" />}
          />

          <div className="space-y-6">
            {/* Calendar Container */}
            <Card className="p-6 bg-background border shadow-lg">
              <FullCalendar
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView="listWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                events={events}
                eventContent={renderEventContent}
                height="auto"
                timeZone="local"
                nowIndicator={true}
                now={new Date()}
                slotMinTime="09:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:30:00"
                snapDuration="00:30:00"
                allDaySlot={false}
                selectable={false}
                editable={false}
                viewDidMount={(view) => setCurrentView(view.view.type)}
              />
            </Card>

            {/* Legend */}
            <Card className="p-6 bg-background border shadow-lg transition-all hover:shadow-xl">
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <BookOpen className="mr-2 h-5 w-5 text-primary" /> Schedule
                Legend
              </h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      backgroundColor: isDarkMode()
                        ? offlineForegroundDark
                        : offlineForeground,
                    }}
                  ></div>
                  <span>Offline Session</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      backgroundColor: isDarkMode()
                        ? onlineForegroundDark
                        : onlineForeground,
                    }}
                  ></div>
                  <span>Online Session</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
      <style jsx global>{`
        /* Base calendar styles */
        .fc-button {
          background-color: #ef4444 !important;
          border-color: #ef4444 !important;
          color: white !important;
          transition: background-color 0.2s ease;
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

        /* Common styles across all views */
        .fc-event-title {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
          word-wrap: break-word !important;
        }
        
        .fc-daygrid-event {
          height: auto !important;
        }

        /* Fix for the list view hover issue */
        .fc-list-event:hover td {
          background-color: rgba(240, 240, 240, 0.7) !important;
        }
        
        /* Dark mode styles with less contrast borders */
        .dark .fc {
          /* Using more subtle border colors that are closer to background */
          --fc-border-color: rgba(50, 50, 50, 0.8);
          --fc-event-border-color: rgba(60, 60, 60, 0.8);
          --fc-non-business-color: rgba(40, 40, 40, 0.3);
          --fc-today-bg-color: rgba(239, 68, 68, 0.07);
          
          /* Button styles - unchanged */
          --fc-button-bg-color: rgb(127, 0, 0);
          --fc-button-border-color: rgb(127, 0, 0);
          --fc-button-hover-bg-color: rgba(127, 0, 0, 0.8);
          --fc-button-hover-border-color: rgba(127, 0, 0, 0.8);
          --fc-button-active-bg-color: rgba(127, 0, 0, 0.9);
          
          /* List view styles */
          --fc-list-event-hover-bg-color: rgba(60, 60, 60, 0.4);
        }
        
        /* Enhanced borders for dark mode - more subtle */
        .dark .fc th,
        .dark .fc td,
        .dark .fc .fc-divider,
        .dark .fc .fc-list-table {
          border-color: rgba(50, 50, 50, 0.8) !important;
        }
        
        /* Extra highlight for key borders - still subtle */
        .dark .fc .fc-scrollgrid,
        .dark .fc .fc-scrollgrid-section,
        .dark .fc .fc-col-header-cell,
        .dark .fc .fc-list-day-cushion {
          border-color: rgba(60, 60, 60, 0.8) !important;
        }
        
        /* Subtle borders for events */
        .dark .fc-event {
          border: 1px solid rgba(60, 60, 60, 0.8) !important;
          box-shadow: none !important;
        }
        
        /* Enforce visibility of lines but keep subtle */
        .dark .fc-timegrid-slot,
        .dark .fc-timegrid-axis,
        .dark .fc-scrollgrid-sync-inner {
          border-color: rgba(45, 45, 45, 0.8) !important;
        }
        
        /* Make list view items more subtle */
        .dark .fc-list-event td {
          border-color: rgba(50, 50, 50, 0.8) !important;
        }
        
        /* Remove box shadows */
        .dark .fc-timegrid-event-harness-inset .fc-timegrid-event,
        .dark .fc-timegrid-event.fc-event-mirror,
        .dark .fc-timegrid-more-link {
          box-shadow: none !important;
        }

        
      `}</style>
    </Layout>
  );
};

export default StudentSchedule;
