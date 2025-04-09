import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list"; // Added for list view
import Layout from "@/components/layout/Layout";
import { Calendar, MapPin, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { axiosBackendInstance } from "@/api/config";
import { format, isToday, isFuture, isPast } from "date-fns";

const StudentSchedule = () => {
  const {studentTrack , setStudentTrack } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const { toast } = useToast();

  useEffect(() => {
    if (studentTrack) {
      fetchEvents(studentTrack.track.id);
    } else {
      setIsLoading(false);
      toast({
        title: "No track found",
        description: "You are not assigned to any track.",
        variant: "destructive",
      });
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
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch your schedule. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const renderEventContent = (eventInfo) => {
    const isOnline = Boolean(eventInfo.event.extendedProps.isOnline);
    const bgColor = isOnline ? "bg-accent" : "bg-primary";
    const textColor = isOnline
      ? "text-accent-foreground"
      : "text-primary-foreground";
    const subtextColor = isOnline ? "text-gray-700" : "text-gray-300";
    
    // Check if we're in list view
    const isListView = ['listDay', 'listWeek', 'listMonth'].includes(currentView);

    return (
      <div
        className={`flex items-center p-1 ${bgColor} ${textColor} rounded w-full h-full`}
      >
        {!isListView && currentView !== "dayGridMonth" && (
          <div
            className={`flex space-x-1 absolute right-1 top-1 items-center text-xs italic font-bold ${subtextColor}`}
          >
            {isOnline ? (
              <>
                <MapPin size={12} className="mr-1" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin size={12} className="mr-1" />
                <span>{eventInfo.event.extendedProps.branch?.name}</span>
              </>
            )}
          </div>
        )}
        <div className="p-1 flex-col w-full">
          <div className="whitespace-normal font-medium">{eventInfo.event.title}</div>
          <div className={`text-xs ${subtextColor} flex items-center justify-between`}>
            <span>{eventInfo.event.extendedProps.instructor || ""}</span>
            {isListView && (
              <span className="flex items-center ml-2">
                <MapPin size={12} className="mr-1" />
                {isOnline ? "Online" : eventInfo.event.extendedProps.branch?.name}
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
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-300 mb-4"></div>
            <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-36 bg-gray-300 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          <PageTitle
            title="My Schedule"
            subtitle={studentTrack ? `Track: ${studentTrack.track.name}` : "View your class schedule"}
            icon={<Calendar className="text-primary" />}
          />

          <div className="space-y-6">


            {/* Calendar Container */}
            <Card className="p-6 bg-white border shadow-lg">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
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
                        <Card className="p-6 bg-white border shadow-lg transition-all hover:shadow-xl">
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <BookOpen className="mr-2 h-5 w-5 text-primary" /> Schedule Legend
              </h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>Offline Session</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-accent mr-2"></div>
                  <span>Online Session</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
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
          transition: transform 0.2s ease;
        }
        .fc-event:hover {
          transform: scale(1.02);
        }
        .fc-event-title {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
          word-wrap: break-word !important;
        }
        .fc-daygrid-event {
          height: auto !important;
        }
        .fc-today-button {
          font-weight: bold !important;
        }
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: bold !important;
        }
        .fc-day-today {
          background-color: rgba(239, 68, 68, 0.05) !important;
        }
      `}</style>
    </Layout>
  );
};

export default StudentSchedule;
