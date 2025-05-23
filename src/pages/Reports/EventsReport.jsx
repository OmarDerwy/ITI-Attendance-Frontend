import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Filter, Search, Users, Calendar, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import EventsTable from "@/components/events/EventsTable";
import { attendance_stats, getGuestsData } from "@/api/events";

const EventsReport = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    title: "",
    date: null,
  });

  const [eventsWithDetails, setEventsWithDetails] = useState([]);

  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ["events-report"],
    queryFn: attendance_stats,
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventsData) {
        const detailedEvents = await Promise.all(
          eventsData.map(async (event) => {
            try {
              const guestsData = await getGuestsData(event.id);
              return {
                ...event,
                attendees: [], // Replace with actual attendee data if available
                guests: guestsData.enrolled.map(guestEnrollment => ({
                  id: guestEnrollment.guest_details.id,
                  name: `${guestEnrollment.guest_details.first_name} ${guestEnrollment.guest_details.last_name}`,
                  organization: guestEnrollment.guest_details.university_name || guestEnrollment.guest_details.college_name || "N/A",
                })),
                enrolled: guestsData.enrolled.length,
                attended: guestsData.attended.length,
              };
            } catch (error) {
              console.error("Error fetching guest data for event", event.id, error);
              return { ...event, attendees: [], guests: [], enrolled: 0, attended: 0 };
            }
          })
        );
        setEventsWithDetails(detailedEvents);
      }
    };

    fetchEventDetails();
  }, [eventsData]);

  const filteredEvents = eventsWithDetails.filter((event) => {
    // Filter by title
    if (filters.title && !event.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }

    // Filter by date
    if (filters.date) {
      const eventDate = new Date(event.date);
      const filterDate = new Date(filters.date);
      
      if (
        eventDate.getDate() !== filterDate.getDate() ||
        eventDate.getMonth() !== filterDate.getMonth() ||
        eventDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }

    return true;
  });

  const handleTitleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleDateFilterChange = (date) => {
    setFilters((prev) => ({ ...prev, date }));
  };

  const handleClearFilters = () => {
    setFilters({ title: "", date: null });
    toast({
      title: "Filters cleared",
      description: "All filters have been reset.",
    });
  };

  const isLoading = isEventsLoading || eventsWithDetails.length === 0;

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <PageTitle
          title="Events Report"
          subtitle="View and analyze event attendance data"
          icon={<Calendar className="h-6 w-6" />}
        />

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Events Filter</CardTitle>
            <CardDescription>
              Filter events by title and date to find specific reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Filter by event title..."
                    className="pl-8"
                    value={filters.title}
                    onChange={handleTitleFilterChange}
                  />
                </div>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal w-full sm:w-auto"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.date ? (
                      format(filters.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={filters.date}
                    onSelect={handleDateFilterChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-card rounded-lg border shadow">
          <EventsTable events={filteredEvents} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
};

export default EventsReport;