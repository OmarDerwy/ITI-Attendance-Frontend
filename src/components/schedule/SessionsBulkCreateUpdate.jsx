import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Share } from "lucide-react";
import { axiosBackendInstance } from "@/api/config";

const SessionsBulkCreateUpdate = ({ events }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveChanges = async () => {
    const newEvents = events.filter((event) =>
      String(event.id)?.startsWith("react")
    );
    const updatedEvents = events.filter(
      (event) => !String(event.id)?.startsWith("react")
    );

    try {
      // reset newEvents IDs to null
      newEvents.forEach((event) => {
        event.id = null;
      });

      const combinedEvents = [...newEvents, ...updatedEvents];
      console.log(
        JSON.stringify({
          combinedEvents,
        })
      );
      const response = await axiosBackendInstance.post(
        "/attendance/sessions/bulk-create-or-update/",
        {
          combinedEvents,
        }
      );
      if (response.ok) {
        toast.success(`Schedule saved successfully.`);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to submit schedule. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the schedule.");
    }
  };

  const renderTable = (events, title) => (
    <div>
      <h3 className="font-bold mb-2">{title}</h3>
      <div className="overflow-x-auto max-h-60 border rounded">
        <table className="table-auto w-full text-left text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Instructor</th>
              <th className="px-4 py-2">Online</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">Branch</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={String(event.id) || event.title} className="border-t">
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">{event.instructor || "N/A"}</td>
                <td className="px-4 py-2">{event.isOnline ? "Yes" : "No"}</td>
                <td className="px-4 py-2">
                  {event.start
                    ? new Date(event.start).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {event.start
                    ? new Date(event.start).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {event.end
                    ? new Date(event.end).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                </td>
                <td className="px-4 py-2">{event.branch?.name || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        onClick={() => setIsDialogOpen(true)}
      >
        <Share className="h-4 w-4 mr-2" /> Save Changes
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          aria-describedby="Bulk Create/update sessions"
          className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Review your changes before you submit</DialogTitle>
          </DialogHeader>

          {/* Render table for new events if any exist */}
          {events.filter((event) => String(event.id)?.startsWith("react"))
            .length > 0 &&
            renderTable(
              events.filter((event) => String(event.id)?.startsWith("react")),
              "New Events"
            )}
          {events.filter((event) => !String(event.id)?.startsWith("react"))
            .length > 0 &&
            renderTable(
              events.filter(
                (event) => !String(event.id)?.startsWith("react")
              ),
              "Updated Events"
            )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {/* Show submit button only if there are events to submit */}
            {events.length > 0 && (
              <Button onClick={handleSaveChanges}>Submit</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionsBulkCreateUpdate;
