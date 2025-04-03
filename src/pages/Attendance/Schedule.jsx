import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "@/components/layout/Layout";
import { Calendar, Share, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";
import axiosBackendInstance from "@/api/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Schedule = () => {
  const { userRole } = useUser();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedTimeInfo, setSelectedTimeInfo] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // API functions for event CRUD operations
  const sendEventToAPI = async (event, method = "POST", endpoint = "/attendance/sessions/") => {
    try {
      let response;

      switch (method) {
        case "POST":
          response = await axiosBackendInstance.post(endpoint, event);
          break;
        case "PUT":
          response = await axiosBackendInstance.put(endpoint, event);
          break;
        case "DELETE":
          response = await axiosBackendInstance.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error sending event to API:", error);
    }
  };

  // Fetch tracks from API
  const fetchTracks = async () => {
    if (userRole !== "supervisor") return;
    
    try {
      setIsLoadingTracks(true);
      const response = await axiosBackendInstance.get("/attendance/tracks/");
      const trackData = response.data.results;
      const trackNames = trackData.map((track) => {
        return { id: track.id, name: track.name };
      })
      setTracks(trackNames);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      // Fallback to some default tracks if API fails
      setTracks([
        { id: "1", name: "Web Development" },
        { id: "2", name: "Mobile Development" },
        { id: "3", name: "Data Science" },
      ]);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // Load events from API when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axiosBackendInstance.get("/api/events");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Load tracks when component mounts (if user is supervisor)
  useEffect(() => {
    if (userRole === "supervisor") {
      fetchTracks();
    }
  }, [userRole]);

  // Handle adding an event - now opens modal instead of prompt
  const handleDateSelect = (selectInfo) => {
    setSelectedTimeInfo(selectInfo);
    setIsModalOpen(true);
  };

  // Create event after form submission
  const handleCreateEvent = () => {
    if (eventTitle && selectedTrack && selectedTimeInfo) {
      const newEvent = {
        name: eventTitle,
        start_time: selectedTimeInfo.startStr,
        end_time: selectedTimeInfo.endStr,
        trackId: selectedTrack, // Include track information
        extendedProps: {
          trackName: tracks.find(track => track.id === selectedTrack)?.name || ""
        }
      };

      // First update UI for responsiveness
      setEvents((prev) => [...prev, newEvent]);

      // Then send to API
      sendEventToAPI(newEvent);

      // Reset form and close modal
      resetFormAndCloseModal();
    }
  };

  const resetFormAndCloseModal = () => {
    setEventTitle("");
    setSelectedTrack("");
    setSelectedTimeInfo(null);
    setIsModalOpen(false);
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      // First update UI
      setEvents((prev) => prev.filter((event) => event.id !== eventId));

      // Then send to API
      sendEventToAPI({ id: eventId }, "DELETE", `/api/events/${eventId}`);
    }
  };

  // Handle event resizing
  const handleEventResize = (resizeInfo) => {
    const updatedEvent = {
      id: resizeInfo.event.id,
      title: resizeInfo.event.title,
      start: resizeInfo.event.startStr,
      end: resizeInfo.event.endStr,
    };

    // First update UI
    setEvents((prev) =>
      prev.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );

    // Then send to API
    sendEventToAPI(updatedEvent, "PUT", `/api/events/${updatedEvent.id}`);
  };

  // Custom event rendering (with delete button inside event)
  const renderEventContent = (eventInfo) => (
    <div className="flex items-center justify-between p-1 bg-red-200 rounded text-red-900">
      <div className="truncate">
        <div>{eventInfo.event.title}</div>
        {eventInfo.event.extendedProps.trackName && (
          <small className="text-xs opacity-75">{eventInfo.event.extendedProps.trackName}</small>
        )}
      </div>
      <button
        onClick={() => handleDeleteEvent(eventInfo.event.id)}
        className="text-red-600 hover:text-red-800"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <Layout>
      <PageTitle
        title="Schedule"
        subtitle={userRole === "student" ? "View your class schedule" : "Manage class schedules"}
        icon={<Calendar />}
      />
      <Card className="p-6 bg-white border shadow-lg">
        {userRole === "supervisor" && (
          <div className="mb-4 flex justify-between">
            <p className="text-red-700 font-medium">Click on a date to add a session.</p>
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              <Share className="h-4 w-4 mr-2" /> Share with students
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading schedule...</p>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            selectable={userRole === "supervisor"}
            editable={true} // Enable event resizing
            select={handleDateSelect}
            events={events}
            eventResize={handleEventResize} // Handle resizing events
            height="auto"
            eventClick={(info) => handleDeleteEvent(info.event.id)}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            className="text-gray-800"
            eventBackgroundColor="#fecaca"
            eventBorderColor="#ef4444"
            eventContent={renderEventContent} // Custom event rendering
            validRange={{ start: new Date() }} // Disable past days
            slotMinTime="08:00:00" // Start from 8 AM
            slotMaxTime="17:00:00" // End at 5 PM
          />
        )}
        <style jsx global>{`
          .fc-button {
            background-color: #ef4444 !important; /* Red background */
            border-color: #ef4444 !important;
            color: white !important;
          }
          .fc-button:hover {
            background-color: #dc2626 !important; /* Darker red on hover */
            border-color: #dc2626 !important;
          }
          .fc-event {
            background-color: #fecaca !important; /* Light red event background */
            border-color: #ef4444 !important;
            color: #b91c1c !important;
          }
        `}</style>

        {/* Event Creation Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-red-600">Create New Session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-gray-700">Session Title</Label>
                <Input
                  id="title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter session title"
                  className="border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="track" className="text-gray-700">Select Track</Label>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger 
                    id="track" 
                    className="w-full border-gray-300 focus:border-red-500"
                    disabled={isLoadingTracks}
                  >
                    <SelectValue placeholder={isLoadingTracks ? "Loading tracks..." : "Select a track"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tracks.length > 0 ? (
                      tracks.map((track) => (
                        <SelectItem key={track.id} value={track.id}>
                          {track.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-tracks" disabled>
                        No tracks available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  Start: {selectedTimeInfo?.startStr ? new Date(selectedTimeInfo.startStr).toLocaleString() : ""}
                </p>
                <p>
                  End: {selectedTimeInfo?.endStr ? new Date(selectedTimeInfo.endStr).toLocaleString() : ""}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetFormAndCloseModal}>
                Cancel
              </Button>
              <Button 
                className="bg-red-600 text-white hover:bg-red-700" 
                onClick={handleCreateEvent}
                disabled={!eventTitle || !selectedTrack}
              >
                Create Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </Layout>
  );
};

export default Schedule;
