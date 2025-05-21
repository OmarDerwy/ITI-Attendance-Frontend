import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AttendeesList from "./AttendeesList";
import EnrolledList from "./EnrolledList";

const ITEMS_PER_PAGE = 5;

const EventsTable = ({ events = [], isLoading }) => {
  const { toast } = useToast();
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); // 'attendees' or 'enrolled'
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleExpand = (eventId, section) => {
    if (expandedEventId === eventId && expandedSection === section) {
      setExpandedEventId(null);
      setExpandedSection(null);
    } else {
      setExpandedEventId(eventId);
      setExpandedSection(section);
    }
  };

  const exportToCSV = (eventId, section) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    let csvHeader, csvRows, filename;
    
    if (section === 'enrolled') {
      // Get all enrolled participants (both attendees and guests)
      const enrolledParticipants = [
        ...(event.attendees || []).map(a => ({ ...a, type: 'attendee' })),
        ...(event.guests || []).map(g => ({ ...g, type: 'guest' }))
      ];
      
      csvHeader = "Name,Type,Contact,Details\n";
      csvRows = enrolledParticipants.map(p => {
        const contact = p.type === 'attendee' ? p.phone : '';
        const details = p.type === 'guest' ? p.organization : p.college;
        return `"${p.name}","${p.type}","${contact}","${details}"`;
      }).join("\n");
      filename = `${event.title.replace(/\s+/g, '_')}_enrolled.csv`;
    } else if (section === 'attendees') {
      csvHeader = "Name,Phone,College,Graduation Year,Previous Events,Previous Event Names\n";
      csvRows = (event.attendees || []).map(attendee => {
        const eventNames = attendee.previousEventNames ? 
          `"${attendee.previousEventNames.join('; ')}"` : 
          '""';
        
        return `"${attendee.name}","${attendee.phone}","${attendee.college}",${attendee.graduationYear},${attendee.previousEvents},${eventNames}`;
      }).join("\n");
      filename = `${event.title.replace(/\s+/g, '_')}_attendees.csv`;
    }

    const csvContent = csvHeader + csvRows;

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV Downloaded",
      description: `${section === 'attendees' ? 'Attendees' : 'Enrolled participants'} list for "${event.title}" has been exported successfully.`,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedEventId(null);
    setExpandedSection(null);
  };

  if (isLoading) {
    return (
      <div className="w-full p-4">
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No events found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Event Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEvents.map((event) => (
              <>
                <TableRow key={event.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{format(new Date(event.date), "MMMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{(event.attendees?.length || 0) + (event.guests?.length || 0)}</Badge>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpand(event.id, 'enrolled')}
                            >
                              {expandedEventId === event.id && expandedSection === 'enrolled' ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span className="sr-only">Show enrolled</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View enrolled list</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportToCSV(event.id, 'enrolled')}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download enrolled</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export enrolled as CSV</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{(event.attendees?.length || 0)}</Badge>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpand(event.id, 'attendees')}
                            >
                              {expandedEventId === event.id && expandedSection === 'attendees' ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span className="sr-only">Show attendees</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View attendees list</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportToCSV(event.id, 'attendees')}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download attendees</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export attendees as CSV</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-sm font-medium">
                        {event.attended} / {event.enrolled}
                      </div>
                      <Progress 
                        value={((event.attended || 0) / (event.enrolled || 1)) * 100}
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(((event.attended || 0) / (event.enrolled || 1)) * 100)}% attendance
                      </div>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded sections */}
                {expandedEventId === event.id && expandedSection === 'attendees' && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-muted/30 p-0">
                      <div className="p-4">
                        <AttendeesList attendees={event.attendees || []} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {expandedEventId === event.id && expandedSection === 'enrolled' && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-muted/30 p-0">
                      <div className="p-4">
                        <EnrolledList 
                          enrolled={[
                            ...(event.attendees || []).map(a => ({ ...a, type: 'attendee' })),
                            ...(event.guests || []).map(g => ({ ...g, type: 'guest' }))
                          ]} 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first page, current page, last page, and pages immediately before and after current
                if (
                  page === 1 ||
                  page === totalPages ||
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage + 1
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <PaginationEllipsis key={page} />;
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default EventsTable;