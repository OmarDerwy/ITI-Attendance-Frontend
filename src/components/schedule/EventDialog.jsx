import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from '@/components/ui/textarea';

const EventDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedEvent, 
  newEvent, 
  onEventUpdate, 
  onNewEventChange, 
  onSubmit, 
  onDelete 
}) => {
  // Helper function to update selected event
  const updateSelectedEvent = (field, value) => {
    onEventUpdate(field, value);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {selectedEvent ? "Edit Event" : "Add Event"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-title" className="text-right pt-2">
              Title
            </Label>
            <div className="col-span-3">
              <Textarea
                id="event-title"
                value={selectedEvent ? selectedEvent.title : newEvent.title}
                onChange={(e) =>
                  selectedEvent
                    ? updateSelectedEvent("title", e.target.value)
                    : onNewEventChange({ ...newEvent, title: e.target.value })
                }
                className="min-h-[80px] resize-y"
                placeholder="Enter session title"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-instructor" className="text-right">
              Instructor
            </Label>
            <Input
              id="event-instructor"
              value={
                selectedEvent ? selectedEvent.instructor : newEvent.instructor
              }
              onChange={(e) =>
                selectedEvent
                  ? updateSelectedEvent("instructor", e.target.value)
                  : onNewEventChange({ ...newEvent, instructor: e.target.value })
              }
              className="col-span-3 truncate" // Allow long text
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-online" className="text-right">
              Online
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="event-online"
                checked={
                  selectedEvent ? selectedEvent.isOnline : newEvent.isOnline
                }
                onCheckedChange={(checked) =>
                  selectedEvent
                    ? updateSelectedEvent("isOnline", checked)
                    : onNewEventChange({
                        ...newEvent,
                        isOnline: checked,
                      })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-dates" className="text-right">
              Dates
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 col-span-3 w-full">
              <div className="space-y-1">
                <Label
                  htmlFor="event-start"
                  className="text-xs text-gray-500"
                >
                  Start
                </Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={
                    selectedEvent
                      ? selectedEvent.start?.slice(0, 16)
                      : newEvent.start?.slice(0, 16)
                  }
                  onChange={(e) =>
                    selectedEvent
                      ? updateSelectedEvent("start", e.target.value)
                      : onNewEventChange({ ...newEvent, start: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="event-end" className="text-xs text-gray-500">
                  End
                </Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={
                    selectedEvent
                      ? selectedEvent.end?.slice(0, 16)
                      : newEvent.end?.slice(0, 16)
                  }
                  onChange={(e) =>
                    selectedEvent
                      ? updateSelectedEvent("end", e.target.value)
                      : onNewEventChange({ ...newEvent, end: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {selectedEvent && (
            <Button
              variant="destructive"
              onClick={() => onDelete(selectedEvent.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>
              {selectedEvent ? "Update Event" : "Add Event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;