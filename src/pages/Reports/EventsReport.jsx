import { useState } from "react";
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

// Mock data fetcher - would be replaced with actual API call
const fetchEvents = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 1,
      title: "Web Development Workshop",
      date: new Date(2025, 4, 15),
      enrolled: 45,
      attended: 38,
      attendees: [
        { 
          id: 1, 
          name: "Ahmed Mohamed", 
          phone: "+201234567890", 
          college: "Engineering", 
          graduationYear: 2025, 
          previousEvents: 3,
          previousEventNames: ["AI and Machine Learning Seminar", "Career Day", "Mobile App Development Workshop"]
        },
        { 
          id: 2, 
          name: "Sara Ali", 
          phone: "+201234567891", 
          college: "Computer Science", 
          graduationYear: 2024, 
          previousEvents: 2,
          previousEventNames: ["Entrepreneurship Forum", "Career Day"]
        },
        { 
          id: 3, 
          name: "Omar Hassan", 
          phone: "+201234567892", 
          college: "Business", 
          graduationYear: 2023, 
          previousEvents: 5,
          previousEventNames: ["AI and Machine Learning Seminar", "Career Day", "Mobile App Development Workshop", "Entrepreneurship Forum", "Cybersecurity Workshop"]
        },
        // More attendees...
      ],
      guests: [
        { id: 1, name: "Dr. Khaled Mahmoud", organization: "Tech Solutions Inc." },
        { id: 2, name: "Eng. Laila Ahmed", organization: "Web Experts" },
      ]
    },
    {
      id: 2,
      title: "AI and Machine Learning Seminar",
      date: new Date(2025, 4, 20),
      enrolled: 60,
      attended: 52,
      attendees: [
        { 
          id: 4, 
          name: "Nour Ibrahim", 
          phone: "+201234567893", 
          college: "Computer Science", 
          graduationYear: 2024, 
          previousEvents: 1,
          previousEventNames: ["Web Development Workshop"]
        },
        { 
          id: 5, 
          name: "Mahmoud Adel", 
          phone: "+201234567894", 
          college: "Engineering", 
          graduationYear: 2023, 
          previousEvents: 4,
          previousEventNames: ["Web Development Workshop", "Career Day", "Mobile App Development Workshop", "Entrepreneurship Forum"]
        },
        // More attendees...
      ],
      guests: [
        { id: 3, name: "Prof. Amr Saad", organization: "AI Research Center" },
      ]
    },
    {
      id: 3,
      title: "Career Day",
      date: new Date(2025, 4, 25),
      enrolled: 120,
      attended: 98,
      attendees: [
        { 
          id: 6, 
          name: "Salma Karim", 
          phone: "+201234567895", 
          college: "Business", 
          graduationYear: 2025, 
          previousEvents: 2,
          previousEventNames: ["Web Development Workshop", "AI and Machine Learning Seminar"]
        },
        { 
          id: 7, 
          name: "Hassan Ali", 
          phone: "+201234567896", 
          college: "Engineering", 
          graduationYear: 2024, 
          previousEvents: 3,
          previousEventNames: ["Web Development Workshop", "AI and Machine Learning Seminar", "Cybersecurity Workshop"]
        },
        // More attendees...
      ],
      guests: [
        { id: 4, name: "Mrs. Hoda Fahmy", organization: "Global Recruiters" },
        { id: 5, name: "Mr. Tarek Zidan", organization: "Tech Innovators Ltd." },
      ]
    },
    {
      id: 4,
      title: "Mobile App Development Workshop",
      date: new Date(2025, 5, 5),
      enrolled: 40,
      attended: 35,
      attendees: [
        { 
          id: 8, 
          name: "Mariam Ahmed", 
          phone: "+201234567897", 
          college: "Computer Science", 
          graduationYear: 2025, 
          previousEvents: 1,
          previousEventNames: ["Web Development Workshop"]
        },
        { 
          id: 9, 
          name: "Youssef Hany", 
          phone: "+201234567898", 
          college: "Engineering", 
          graduationYear: 2024, 
          previousEvents: 2,
          previousEventNames: ["Web Development Workshop", "AI and Machine Learning Seminar"]
        },
        // More attendees...
      ],
      guests: [
        { id: 6, name: "Eng. Mohamed Samy", organization: "Mobile Solutions" },
      ]
    },
    {
      id: 5,
      title: "Entrepreneurship Forum",
      date: new Date(2025, 5, 15),
      enrolled: 80,
      attended: 72,
      attendees: [
        { 
          id: 10, 
          name: "Fatima Omar", 
          phone: "+201234567899", 
          college: "Business", 
          graduationYear: 2023, 
          previousEvents: 4,
          previousEventNames: ["Web Development Workshop", "AI and Machine Learning Seminar", "Career Day", "Mobile App Development Workshop"]
        },
        { 
          id: 11, 
          name: "Karim Essam", 
          phone: "+201234567900", 
          college: "Engineering", 
          graduationYear: 2025, 
          previousEvents: 2,
          previousEventNames: ["Web Development Workshop", "Career Day"]
        },
        // More attendees...
      ],
      guests: [
        { id: 7, name: "Dr. Hossam Nour", organization: "Startup Hub" },
        { id: 8, name: "Ms. Nada Samir", organization: "Business Incubator" },
      ]
    },
    {
      id: 6,
      title: "Cybersecurity Workshop",
      date: new Date(2025, 5, 25),
      enrolled: 35,
      attended: 30,
      attendees: [
        { 
          id: 12, 
          name: "Amr Khaled", 
          phone: "+201234567901", 
          college: "Computer Science", 
          graduationYear: 2023, 
          previousEvents: 3,
          previousEventNames: ["Web Development Workshop", "AI and Machine Learning Seminar", "Mobile App Development Workshop"]
        },
        { 
          id: 13, 
          name: "Heba Ahmed", 
          phone: "+201234567902", 
          college: "Engineering", 
          graduationYear: 2024, 
          previousEvents: 2,
          previousEventNames: ["Web Development Workshop", "Career Day"]
        },
        // More attendees...
      ],
      guests: [
        { id: 9, name: "Eng. Tamer Fahmy", organization: "CyberGuard" },
      ]
    },
  ];
};

const EventsReport = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    title: "",
    date: null,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-report"],
    queryFn: fetchEvents,
  });

  const filteredEvents = events.filter((event) => {
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