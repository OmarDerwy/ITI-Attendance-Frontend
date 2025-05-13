import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const EnrolledList = ({ enrolled }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const filteredEnrolled = enrolled.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone?.includes(searchTerm)
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEnrolled.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEnrolled.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Enrolled Participants</h3>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search enrolled..."
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
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map(person => (
                <TableRow key={person.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <Badge variant={person.type === 'guest' ? "secondary" : "outline"}>
                      {person.type === 'guest' ? 'Speaker/VIP' : 'Attendee'}
                    </Badge>
                  </TableCell>
                  <TableCell>{person.phone || person.organization || "—"}</TableCell>
                  <TableCell>{person.college || person.organization || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No participants found with "{searchTerm}"
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
        Showing {filteredEnrolled.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEnrolled.length)} of {filteredEnrolled.length} enrolled
      </div>
    </div>
  );
};

export default EnrolledList;