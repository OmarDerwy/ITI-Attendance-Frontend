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
import { 
  Save, 
  X 
} from "lucide-react";
import { axiosBackendInstance } from "@/api/config";
import { Badge } from "@/components/ui/badge";

const SessionsBulkCreateUpdate = ({ events, deletedEventIds = [], deletedEvents = [], onSaveSuccess }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveChanges = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // Set loading state

    const newEvents = events.filter((event) =>
      String(event.id)?.startsWith("react")
    );
    const updatedEvents = events.filter(
      (event) => !String(event.id)?.startsWith("react")
    );
    try {
      // reset newEvents IDs to null
      const eventsToSubmit = [
        ...newEvents.map(event => ({...event, id: null})),
        ...updatedEvents
      ];
      
      const response = await axiosBackendInstance.post(
        "/attendance/sessions/bulk-create-or-update/",
        {
          combinedEvents: eventsToSubmit,
          deletedEvents: deletedEventIds, // Include deleted event IDs in the request
        }
      );
      
      // Properly handle the success response from axios
      if (response.status >= 200 && response.status < 300) {
        const { created_sessions, updated_sessions, deleted_sessions } = response.data;
        const createdCount = created_sessions?.length || 0;
        const updatedCount = updated_sessions?.length || 0;
        const deletedCount = deleted_sessions?.length || 0;
        
        let successMessage = "Schedule saved successfully.";
        if (createdCount > 0 || updatedCount > 0 || deletedCount > 0) {
          successMessage = `${createdCount} session(s) created, ${updatedCount} session(s) updated, ${deletedCount} session(s) deleted.`;
        }
        
        toast.success(successMessage);
        setIsDialogOpen(false);
        
        // Call the onSaveSuccess callback to notify parent component
        // This will reset the isModified flag on all events
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        toast.error("Failed to submit schedule. Please try again.");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("An error occurred while submitting the schedule.");
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const renderTable = (events, title, isDeleted = false) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-bold">{title}</h3>
        <Badge variant={isDeleted ? "destructive" : "secondary"}>
          {events.length}
        </Badge>
      </div>
      <div className="overflow-x-auto max-h-60 border rounded">
        <table className="table-auto w-full text-left text-sm">
        <thead className="bg-primary/5 sticky top-0">
        <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Instructor</th>
              <th className="px-4 py-2 font-medium text-center">Online</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Start</th>
              <th className="px-4 py-2 font-medium">End</th>
              <th className="px-4 py-2 font-medium">Branch</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map((event) => (
              <tr 
                key={String(event.id) || event.title} 
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">{event.instructor || "N/A"}</td>
                <td className="px-4 py-2 text-center">{event.isOnline ? "Yes" : "No"}</td>
                <td className="px-4 py-2">
                  {event.start
                    ? new Date(event.start).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {event.start
                    ? new Date(event.start).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {event.end
                    ? new Date(event.end).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : "N/A"}
                </td>
                <td className="px-4 py-2">
                  { event.isOnline ?  "N/A" : event.branch?.name || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // If we have deleted events with details, use them; otherwise show just IDs
  const renderDeletedEventsSection = () => {
    if (deletedEvents && deletedEvents.length > 0) {
      return renderTable(deletedEvents, "Deleted Events", true);
    } else if (deletedEventIds.length > 0) {
      // Fallback to showing just IDs if we don't have full event details
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold">Deleted Events</h3>
            <Badge variant="destructive">
              {deletedEventIds.length}
            </Badge>
          </div>
          <div className="overflow-x-auto max-h-60 border rounded border-red-200">
            <table className="table-auto w-full text-left text-sm">
              <thead className="bg-red-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-medium">Event ID</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deletedEventIds.map((id) => (
                  <tr 
                    key={id} 
                    className="hover:bg-red-50/50 transition-colors"
                  >
                    <td className="px-4 py-2">{id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return null;
  };

  const hasChanges = events.length > 0 || deletedEventIds.length > 0;

  return (
    <>
      <Button
        variant="outline"
        disabled={!hasChanges}
        className={`border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors ${
          !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => setIsDialogOpen(true)}
      >
        <Save className="h-4 w-4 mr-2" />
        Save Changes
        {hasChanges && (
          <Badge variant="secondary" className="ml-2">
            {events.length + deletedEventIds.length}
          </Badge>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Review Changes Before Saving
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {events.filter((event) => String(event.id)?.startsWith("react")).length > 0 && (
              renderTable(
                events.filter((event) => String(event.id)?.startsWith("react")),
                "New Events"
              )
            )}
            {events.filter((event) => !String(event.id)?.startsWith("react")).length > 0 && (
              renderTable(
                events.filter((event) => !String(event.id)?.startsWith("react")),
                "Updated Events"
              )
            )}
            {(deletedEventIds.length > 0 || deletedEvents.length > 0) && renderDeletedEventsSection()}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting} // Disable cancel button while submitting
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {hasChanges && (
              <Button 
                onClick={handleSaveChanges}
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting} // Disable submit button while submitting
              >
                {isSubmitting ? "Submitting..." : "Submit Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionsBulkCreateUpdate;