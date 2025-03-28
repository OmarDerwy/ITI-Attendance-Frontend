import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "@/components/layout/Layout";
import { Calendar, Share, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/context/UserContext";

const Schedule = () => {
  const { userRole } = useUser();
  const [events, setEvents] = useState([]);

  // Handle adding an event
  const handleDateSelect = (selectInfo) => {
    const title = prompt("Enter session title:");
    if (title) {
      setEvents((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
        },
      ]);
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  // Handle event resizing
  const handleEventResize = (resizeInfo) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === resizeInfo.event.id
          ? { ...event, start: resizeInfo.event.startStr, end: resizeInfo.event.endStr }
          : event
      )
    );
  };

  // Custom event rendering (with delete button inside event)
  const renderEventContent = (eventInfo) => (
    <div className="flex items-center justify-between p-1 bg-red-200 rounded text-red-900">
      <span className="truncate">{eventInfo.event.title}</span>
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
      </Card>
    </Layout>
  );
};

export default Schedule;
