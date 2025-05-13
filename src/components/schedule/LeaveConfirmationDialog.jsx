import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LeaveConfirmationDialog = ({ 
  isOpen, 
  onOpenChange, 
  pendingTrackId, 
  onCancel, 
  onStay, 
  onLeave 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center space-y-2">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <DialogTitle>Unsaved Changes</DialogTitle>
          <DialogDescription>
            {pendingTrackId
              ? "You have unsaved changes. Changing tracks will lose these changes."
              : "You have unsaved changes to the schedule. What would you like to do?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <div className="space-x-2">
            {!pendingTrackId && (
              <Button onClick={onStay}>
                Stay on Page
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={onLeave}
            >
              {pendingTrackId ? "Change Track" : "Leave Without Saving"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveConfirmationDialog;