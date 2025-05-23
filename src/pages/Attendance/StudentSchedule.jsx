import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import Layout from "@/components/layout/Layout";
import { Calendar, MapPin, BookOpen, Loader2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { axiosBackendInstance } from "@/api/config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const StudentSchedule = () => {
  const { studentTrack, setStudentTrack } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const { toast } = useToast();

  useEffect(() => {
    if (studentTrack) {
      fetchSessions(studentTrack.track.id);
      fetchEvents();
    } else {
      setIsLoading(false);
    }
  }, [studentTrack, toast]);

  const fetchSessions = async (trackId) => {
    try {
      const response = await axiosBackendInstance.get(
        `attendance/sessions/calendar-data/?track_id=${trackId}`
      );

      const fetchedSessions = response.data.map((session) => ({
        id: session.id,
        title: session.title,
        instructor: session.instructor,
        start: session.start,
        end: session.end,
        isOnline: session.is_online,
        trackId: session.track_id,
        branch: session.branch,
        type: 'session',
        extendedProps: {
          isOnline: session.is_online,
          branch: session.branch,
          instructor: session.instructor,
          type: 'session'
        }
      }));

      setSessions(fetchedSessions);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const response = await axiosBackendInstance.get('/attendance/events/');
      console.log('Raw events response:', response.data);
      
      const fetchedEvents = response.data
        .filter(event => event && event.sessions && event.sessions.length > 0) // Filter out invalid events
        .map((event) => {
          // Sort sessions by start time to get first and last session
          const sortedSessions = [...event.sessions].sort((a, b) => 
            new Date(a.start_time) - new Date(b.start_time)
          );
          
          const firstSession = sortedSessions[0];
          const lastSession = sortedSessions[sortedSessions.length - 1];

          console.log('Processing event:', {
            id: event.id,
            title: event.title,
            firstSessionStart: firstSession?.start_time,
            lastSessionEnd: lastSession?.end_time,
            sessionsCount: event.sessions.length
          });

          // Only process events that have valid session times
          if (!firstSession?.start_time || !lastSession?.end_time) {
            console.warn('Skipping event due to missing session times:', event.id);
            return null;
          }

          return {
            id: event.id,
            title: event.title || 'Untitled Event',
            start: firstSession.start_time,
            end: lastSession.end_time,
            type: 'event',
            extendedProps: {
              description: event.description || '',
              branch: event.branch || null,
              audienceType: event.audience_type || '',
              isMandatory: event.is_mandatory || false,
              targetTracks: event.target_tracks || [],
              sessions: event.sessions || [],
              type: 'event'
            }
          };
        })
        .filter(event => event !== null); // Remove any null events

      console.log('Processed events:', fetchedEvents);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const renderEventContent = (eventInfo) => {
    const isEvent = eventInfo.event.extendedProps.type === 'event';
    const isOnline = Boolean(eventInfo.event.extendedProps.isOnline);
    const isPastEvent = new Date(eventInfo.event.start) < new Date();
    
    const textClassName = isEvent ? "event-special-text" : (isOnline ? "event-online-text" : "event-offline-text");
    const branchClassName = isEvent ? "event-special-branch" : (isOnline ? "event-branch-online" : "event-branch-offline");
    
    const isListView = ["listDay", "listWeek", "listMonth"].includes(currentView);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={`flex items-center justify-between p-1 ${textClassName} rounded w-full h-full ${
              isPastEvent ? "opacity-75" : ""
            } cursor-pointer`}
          >
            {!isListView && currentView !== "dayGridMonth" && (
              <div
                className={`flex space-x-1 absolute left-1 bottom-1 items-center text-xs italic ${branchClassName}`}
              >
                {isEvent ? (
                  <>
                    <Info size={12} className="mr-1" />
                    <span className="text-[12px]">Event</span>
                  </>
                ) : isOnline ? (
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
                {isEvent ? "Event" : eventInfo.event.extendedProps.instructor || ""}
              </div>
            </div>
            {isListView && (
              <div className={`flex items-center text-xs ${branchClassName}`}>
                {isEvent ? (
                  <>
                    <Info size={12} className="mr-1" />
                    <span>Event</span>
                  </>
                ) : (
                  <>
                    <MapPin size={12} className="mr-1" />
                    <span>
                      {isOnline ? "Home" : eventInfo.event.extendedProps.branch?.name}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          {isEvent ? (
            <div className="space-y-2">
              <h3 className="font-semibold">{eventInfo.event.title}</h3>
              <p className="text-sm text-muted-foreground">{eventInfo.event.extendedProps.description}</p>
              <div className="text-sm">
                <p><strong>Branch:</strong> {eventInfo.event.extendedProps.branch?.name}</p>
                <p><strong>Audience Type:</strong> {eventInfo.event.extendedProps.audienceType}</p>
                <p><strong>Mandatory:</strong> {eventInfo.event.extendedProps.isMandatory ? 'Yes' : 'No'}</p>
                <div className="mt-2">
                  <p className="font-semibold">Sessions:</p>
                  <ul className="list-disc list-inside">
                    {eventInfo.event.extendedProps.sessions.map((session, index) => (
                      <li key={index} className="text-sm">
                        {session.title} - {new Date(session.start_time).toLocaleTimeString()} to {new Date(session.end_time).toLocaleTimeString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="font-semibold">{eventInfo.event.title}</h3>
              <p className="text-sm"><strong>Instructor:</strong> {eventInfo.event.extendedProps.instructor}</p>
              <p className="text-sm"><strong>Location:</strong> {isOnline ? 'Online' : eventInfo.event.extendedProps.branch?.name}</p>
            </div>
          )}
        </PopoverContent>
      </Popover>
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
                events={[...sessions, ...events]}
                eventContent={renderEventContent}
                eventClassNames={(info) => {
                  if (info.event.extendedProps.type === 'event') {
                    return ['event-special'];
                  }
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

            <Card className="p-6 bg-background border shadow-lg transition-all hover:shadow-xl">
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <BookOpen className="mr-2 h-5 w-5 text-primary" /> Schedule
                Legend
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2 legend-dot-offline"></div>
                  <span>Offline Session</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2 legend-dot-online"></div>
                  <span>Online Session</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-2 legend-dot-special"></div>
                  <span className="font-medium">Special Event</span>
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