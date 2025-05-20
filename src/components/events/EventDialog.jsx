import React, { useEffect, useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, ArrowRight, ArrowLeft } from "lucide-react";
import SimpleTimePicker from "./SimpleTimePicker";
import { motion } from "framer-motion";

const EventDialog = ({
  isOpen,
  onOpenChange,
  selectedEvent,
  newEvent,
  onEventUpdate,
  onNewEventChange,
  onSubmit,
  onDelete,
  parentEvent = null,
  tracks = [],
  position = { x: 0, y: 0 },
  onDockStateChange = () => {},
}) => {
  const dialogRef = useRef(null);
  const [isDocked, setIsDocked] = useState(false);

  const isSubEvent =
    selectedEvent?.parentId || (newEvent?.parentId && !selectedEvent);
  const currentEvent = selectedEvent || newEvent || {};
  const currentParentEvent =
    parentEvent ||
    (isSubEvent && selectedEvent?.parentId
      ? { start: parentEvent?.start, end: parentEvent?.end }
      : null);
  const [lastUndockedPosition, setLastUndockedPosition] = useState(null);
  const [isUndocking, setIsUndocking] = useState(false);

  // Position the dialog based on docking state and click position
  const positionDialog = useCallback(() => {
    if (!dialogRef.current || !isOpen) return;

    const dialog = dialogRef.current;

    // Handle docked state
    if (isDocked) {
      // Remove any transition temporarily for instant docking
      dialog.style.transition = "none";

      // Apply docked position
      Object.assign(dialog.style, {
        position: "fixed",
        right: "0px",
        top: "0px",
        bottom: "0px",
        left: "auto",
        transform: "none",
        borderRadius: "0",
        height: "100vh",
        width: "450px", // Increased width for docked state
        zIndex: "30",
        margin: "0", // Remove any margin
        padding: "0", // Remove any padding
      });

      // Force reflow
      void dialog.offsetWidth;

      // Restore transition
      dialog.style.transition = "all 300ms ease-in-out";

      return;
    }

    // For undocked, set transition first
    dialog.style.transition = "all 300ms ease-in-out";

    // Undocked positioning - basic settings
    Object.assign(dialog.style, {
      position: "fixed",
      zIndex: "50",
      right: "auto",
      bottom: "auto",
      borderRadius: "0.5rem",
      height: "auto",
    });

    // Only use lastUndockedPosition if we're specifically undocking
    // (not for new events or when dialog first opens)
    if (isUndocking && lastUndockedPosition) {
      // Check if the saved position is still valid (within viewport)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const buffer = 20;

      let x = lastUndockedPosition.left;
      let y = lastUndockedPosition.top;

      // Ensure the dialog stays within viewport bounds
      if (x + lastUndockedPosition.width + buffer > viewportWidth) {
        x = viewportWidth - lastUndockedPosition.width - buffer;
      }
      if (x < buffer) {
        x = buffer;
      }

      if (y + lastUndockedPosition.height + buffer > viewportHeight) {
        y = viewportHeight - lastUndockedPosition.height - buffer;
      }
      if (y < buffer) {
        y = buffer;
      }

      // Apply the saved position
      dialog.style.left = `${x}px`;
      dialog.style.top = `${y}px`;
      dialog.style.width = `${lastUndockedPosition.width}px`;

      // Reset undocking state after applying the position
      setTimeout(() => {
        setIsUndocking(false);
      }, 300);

      return;
    }

    // For new events or regular dialog opening, use the smart positioning logic
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buffer = 20;
    const dialogHeight = 450;

    // Determine horizontal position
    let x =
      position.x < viewportWidth / 3
        ? position.x + 10
        : position.x > (viewportWidth * 2) / 3
        ? position.x - 360 - 10
        : position.x - 180;

    // Determine vertical position
    const eventTime = new Date(currentEvent.start || new Date());
    const hour = eventTime.getHours();
    let y =
      hour < 12
        ? position.y + 10
        : hour >= 18
        ? position.y - 10
        : position.y < viewportHeight / 2
        ? position.y + 10
        : position.y - 10;

    // Ensure within bounds
    x = Math.max(buffer, Math.min(viewportWidth - 360 - buffer, x));

    // Check vertical space
    if (y + dialogHeight + buffer > viewportHeight) {
      y =
        position.y - dialogHeight - buffer > 0
          ? position.y - dialogHeight - buffer
          : buffer;
    }
    y = Math.max(buffer, y);

    // Apply position
    dialog.style.left = `${x}px`;
    dialog.style.top = `${y}px`;
    dialog.style.width = "400px"; // Reset width to default

    // Check bottom visibility after render
    setTimeout(() => {
      if (!dialogRef.current) return;
      const rect = dialogRef.current.getBoundingClientRect();
      if (rect.bottom > viewportHeight - buffer) {
        dialogRef.current.style.top = `${Math.max(
          buffer,
          viewportHeight - rect.height - buffer
        )}px`;
      }
    }, 50);
  }, [
    isOpen,
    isDocked,
    position,
    currentEvent.start,
    lastUndockedPosition,
    isUndocking,
  ]);

  // Update event fields
  const updateField = useCallback(
    (field, value) => {
      if (selectedEvent) {
        onEventUpdate(field, value);
      } else {
        onNewEventChange({ ...newEvent, [field]: value });
      }
    },
    [selectedEvent, newEvent, onEventUpdate, onNewEventChange]
  );
  const toggleDock = useCallback(() => {
    const newDockedState = !isDocked;

    // If going from undocked to docked, save the current position
    if (newDockedState && dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      setLastUndockedPosition({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }

    // Track if we're undocking (going from docked to undocked)
    if (!newDockedState) {
      setIsUndocking(true);
    } else {
      setIsUndocking(false);
    }

    // Update dock state
    setIsDocked(newDockedState);

    // Notify parent with slight delay to ensure smooth transition
    setTimeout(() => {
      onDockStateChange(newDockedState);
    }, 50);
  }, [isDocked, onDockStateChange]);
  // Toggle track selection
  const toggleTrackSelection = useCallback(
    (trackId) => {
      const currentTracks = currentEvent.target_tracks || [];
      const updatedTracks = currentTracks.includes(trackId)
        ? currentTracks.filter((id) => id !== trackId)
        : [...currentTracks, trackId];

      updateField("target_tracks", updatedTracks);
    },
    [currentEvent, updateField]
  );

  // Handle time range changes
  const handleTimeRangeChange = useCallback(
    (timeRange) => {
      updateField("start", timeRange.start);
      updateField("end", timeRange.end);
    },
    [updateField]
  );
  useEffect(() => {
    // Position dialog whenever it opens or docking status changes
    if (isOpen) {
      positionDialog();
    }
  }, [isOpen, isDocked, positionDialog]);

  // Add an effect to reset isUndocking when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsUndocking(false);
    }
  }, [isOpen]);
  // Event handlers for clicks
  useEffect(() => {
    // Position dialog whenever it opens or docking changes
    positionDialog();

    // Right-click to close
    const handleRightClick = (e) => {
      if (isOpen && dialogRef.current) {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    // Left-click outside to close
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        dialogRef.current &&
        !dialogRef.current.contains(e.target)
      ) {
        onOpenChange(false);
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, positionDialog, onOpenChange]);

  // Audience options
  const audienceOptions = [
    { value: "students_only", label: "Students Only" },
    { value: "guests_only", label: "Guests Only" },
    { value: "both", label: "Students & Guests" },
  ];

  // Don't render when closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" style={{ pointerEvents: "none" }}>
      <motion.div
        ref={dialogRef}
        className={`fixed bg-background border shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isDocked
            ? "w-[400px] right-0 top-0 bottom-0 rounded-none border-l border-r-0 border-t-0 border-b-0"
            : "w-[360px] max-h-[80vh] rounded-lg"
        }`}
        style={{
          pointerEvents: "auto",
          zIndex: isDocked ? 30 : 50,
        }}
        // Use a simpler animation that doesn't interfere with positioning
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.2 },
        }}
        exit={{
          opacity: 0,
          transition: { duration: 0.2 },
        }}
      >
        <div
          className={`flex flex-col h-full ${
            isDocked ? "max-h-screen" : "max-h-[80vh]"
          }`}
        >
          {/* Dialog Header */}
          <div className="flex justify-between items-center p-4 sticky top-0 bg-background z-10 border-b">
            <h2 className="font-semibold text-lg">
              {selectedEvent
                ? "Edit Event"
                : isSubEvent
                ? "Add Sub-Event"
                : "Add Event"}
            </h2>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDock}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title={isDocked ? "Undock" : "Dock to sidebar"}
              >
                {isDocked ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          {/* Dialog Content */}
          <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
            <div className="space-y-5 pr-1">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="event-title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event-title"
                  value={currentEvent.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter event title"
                  className="w-full"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="event-description"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="event-description"
                  value={currentEvent.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="min-h-[80px] resize-y w-full"
                  placeholder="Enter event description"
                />
              </div>

              {/* Only show audience options for parent events */}
              {!isSubEvent && (
                <>
                  {/* Audience Type */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="audience-type"
                      className="text-sm font-medium"
                    >
                      Audience
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {audienceOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={
                            currentEvent.audience_type === option.value
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateField("audience_type", option.value)
                          }
                          className="w-full text-xs px-1 h-auto py-2"
                          size="sm"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentEvent.is_mandatory || false}
                        onChange={(e) =>
                          updateField("is_mandatory", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Mandatory Attendance
                    </Label>
                    <p className="text-xs text-gray-500">
                      Mark this event as mandatory for the selected audience
                    </p>
                  </div>

                  {/* Target Tracks */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Tracks</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Select specific tracks that can attend this event (leave
                      empty for all tracks)
                    </p>

                    <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto border rounded-md p-2">
                      {tracks.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`track-${track.id}`}
                            checked={(
                              currentEvent.target_tracks || []
                            ).includes(track.id)}
                            onChange={() => toggleTrackSelection(track.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label
                            htmlFor={`track-${track.id}`}
                            className="text-sm"
                          >
                            {track.name}
                          </Label>
                        </div>
                      ))}
                      {tracks.length === 0 && (
                        <div className="text-sm text-gray-500 py-2 text-center">
                          No tracks available
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Time Selection for Sub-events */}
              {isSubEvent && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Time Selection</h3>
                  <SimpleTimePicker
                    parentEvent={currentParentEvent}
                    value={currentEvent}
                    onChange={handleTimeRangeChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="p-4 border-t sticky bottom-0 bg-background z-10">
            <div className="flex justify-between items-center">
              {selectedEvent && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(selectedEvent.id)}
                  className="h-9"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              )}
              <div
                className={`${
                  selectedEvent ? "" : "w-full"
                } flex justify-end space-x-2`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={onSubmit} className="h-9">
                  {selectedEvent ? "Update Event" : "Add Event"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDialog;
