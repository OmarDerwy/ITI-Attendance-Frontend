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

const StudentSchedule = () => {
  const { studentTrack, setStudentTrack } = useUser();
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
        // Use extendedProps to store additional data
        extendedProps: {
          isOnline: event.is_online,
          branch: event.branch,
          instructor: event.instructor
        }
      }));

      setEvents(fetchedEvents);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const renderEventContent = (eventInfo) => {
    const isOnline = Boolean(eventInfo.event.extendedProps.isOnline);
    const isPastEvent = new Date(eventInfo.event.start) < new Date();
    
    // Apply the correct CSS classes based on online/offline status
    const textClassName = isOnline ? "event-online-text" : "event-offline-text";
    const branchClassName = isOnline ? "event-branch-online" : "event-branch-offline";
    
    // Check if we're in list view
    const isListView = ["listDay", "listWeek", "listMonth"].includes(
      currentView
    );

    return (
      <div
        className={`flex items-center justify-between p-1 ${textClassName} rounded w-full h-full ${
          isPastEvent ? "opacity-75" : ""
        }`}
      >
        {!isListView && currentView !== "dayGridMonth" && (
          <div
            className={`flex space-x-1 absolute left-1 bottom-1 items-center text-xs italic ${branchClassName}`}
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
        <div className="p-1 flex-col">
          <div className="whitespace-normal pr-6 truncate-multiline">
            {eventInfo.event.title}
          </div>
          <div className={`text-xs ${branchClassName}`}>
            {eventInfo.event.extendedProps.instructor || ""}
          </div>
        </div>
        {isListView && (
          <div className={`flex items-center text-xs ${branchClassName}`}>
            <MapPin size={12} className="mr-1" />
            <span>
              {isOnline ? "Home" : eventInfo.event.extendedProps.branch?.name}
            </span>
          </div>
        )}
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
                eventClassNames={(info) => {
                  return [info.event.extendedProps.isOnline ? 'event-online' : 'event-offline'];
                }}
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
                  <div className="w-4 h-4 rounded-full mr-2 legend-dot-offline"></div>
                  <span>Offline Session</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2 legend-dot-online"></div>
                  <span>Online Session</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </Layout>
  );
};

export default StudentSchedule;