import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import { Input } from "@/components/ui/input";
  import { Search } from "lucide-react";
  import { useState } from "react";
  import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
  
  const AttendeesList = ({ attendees }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    const filteredAttendees = attendees.filter(attendee =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.phone.includes(searchTerm)
    );
  
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttendees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">Attendees List</h3>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search attendees..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>College</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Graduation year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map(attendee => (
                  <TableRow key={attendee.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{attendee.name}</TableCell>
                    <TableCell>{attendee.phone}</TableCell>
                    <TableCell>{attendee.college}</TableCell>
                    <TableCell>{attendee.graduationYear}</TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant={attendee.previousEvents > 3 ? "default" : "outline"}
                            className={attendee.previousEvents > 3 ? "bg-primary/80 cursor-help" : "cursor-help"}
                          >
                            {attendee.previousEvents}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium mb-1">Previous events:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              {attendee.previousEventNames?.map((name, index) => (
                                <li key={index}>{name}</li>
                              )) || <li>No event history</li>}
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No attendees found with "{searchTerm}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-primary text-primary-foreground' : 'border'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Showing {filteredAttendees.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAttendees.length)} of {filteredAttendees.length} attendees
        </div>
      </div>
    );
  };
  
  export default AttendeesList;