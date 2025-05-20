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

const EventsBulkCreateUpdate = ({ events, deletedEventIds = [], deletedEvents = [], onSaveSuccess }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate if there are any changes to save
  const hasChanges = events.some(event => 
    String(event.id)?.startsWith("react") || event.isModified
  ) || deletedEventIds.length > 0;

  const handleSaveChanges = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // Set loading state

    const newEvents = events.filter((event) =>
      String(event.id)?.startsWith("react")
    );
    const updatedEvents = events.filter(
      (event) => !String(event.id)?.startsWith("react") && event.isModified
    );
    try {
      // reset newEvents IDs to null
      const eventsToSubmit = [
        ...newEvents.map(event => ({...event, id: null})),
        ...updatedEvents
      ];
      
      const response = await axiosBackendInstance.post(
        "/events/bulk-create-or-update/",
        {
          combinedEvents: eventsToSubmit,
          deletedEvents: deletedEventIds, // Include deleted event IDs in the request
        }
      );
      
      // Properly handle the success response from axios
      if (response.status >= 200 && response.status < 300) {
        const { created_events, updated_events, deleted_events } = response.data;
        const createdCount = created_events?.length || 0;
        const updatedCount = updated_events?.length || 0;
        const deletedCount = deleted_events?.length || 0;
        
        let successMessage = "Events saved successfully.";
        if (createdCount > 0 || updatedCount > 0 || deletedCount > 0) {
          successMessage = `${createdCount} event(s) created, ${updatedCount} event(s) updated, ${deletedCount} event(s) deleted.`;
        }
        
        toast.success(successMessage);
        setIsDialogOpen(false);
        
        // Call the onSaveSuccess callback to notify parent component
        // This will reset the isModified flag on all events
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        toast.error("Failed to submit events. Please try again.");
      }
    } catch (error) {
      console.error("Error saving events:", error);
      toast.error(
        error.response?.data?.message || "Failed to save events. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Start</th>
              <th className="px-4 py-2 font-medium">End</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map((event) => (
              <tr 
                key={String(event.id) || event.title} 
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">{event.description || "N/A"}</td>
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
            {events.filter(event => String(event.id)?.startsWith("react") || event.isModified).length + deletedEventIds.length}
          </Badge>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Event Changes</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {events.filter((event) => String(event.id)?.startsWith("react")).length > 0 && (
              renderTable(
                events.filter((event) => String(event.id)?.startsWith("react")),
                "New Events"
              )
            )}

            {events.filter(
              (event) => !String(event.id)?.startsWith("react") && event.isModified
            ).length > 0 && (
              renderTable(
                events.filter(
                  (event) => !String(event.id)?.startsWith("react") && event.isModified
                ),
                "Modified Events"
              )
            )}

            {deletedEvents.length > 0 && (
              renderTable(deletedEvents, "Deleted Events", true)
            )}

            {events.filter((event) => String(event.id)?.startsWith("react")).length === 0 &&
              events.filter(
                (event) => !String(event.id)?.startsWith("react") && event.isModified
              ).length === 0 &&
              deletedEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No changes to save.
                </div>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSubmitting || (
                events.filter((event) => String(event.id)?.startsWith("react")).length === 0 &&
                events.filter(
                  (event) => !String(event.id)?.startsWith("react") && event.isModified
                ).length === 0 &&
                deletedEvents.length === 0
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventsBulkCreateUpdate;