import React, { useEffect, useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, ArrowRight, ArrowLeft } from "lucide-react";
import SimpleTimePicker from "./SimpleTimePicker";
import { motion } from "framer-motion";
import { positionDialog, saveDialogPosition } from "@/utils/DialogPositioner";
import "./EventDialog.css";
import { CSSTransition } from 'react-transition-group';

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
  const [lastUndockedPosition, setLastUndockedPosition] = useState(null);
  const [isUndocking, setIsUndocking] = useState(false);

  const isSubEvent =
    selectedEvent?.parentId || (newEvent?.parentId && !selectedEvent);
  const currentEvent = selectedEvent || newEvent || {};
  const currentParentEvent =
    parentEvent ||
    (isSubEvent && selectedEvent?.parentId
      ? { start: parentEvent?.start, end: parentEvent?.end }
      : null);

  // Position the dialog using the utility function
  const handlePositionDialog = useCallback(() => {
    positionDialog({
      dialogRef,
      isDocked,
      isOpen,
      position,
      lastUndockedPosition,
      isUndocking,
      currentEvent,
    });
    
    // Reset undocking state after applying the position
    if (isUndocking) {
      setTimeout(() => {
        setIsUndocking(false);
      }, 300);
    }
  }, [
    isDocked,
    isOpen,
    position,
    lastUndockedPosition,
    isUndocking,
    currentEvent,
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
      setLastUndockedPosition(saveDialogPosition(dialogRef));
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

  // Position dialog whenever it opens or docking status changes
  useEffect(() => {
    if (isOpen) {
      handlePositionDialog();
    }
  }, [isOpen, isDocked, handlePositionDialog]);

  // Add an effect to reset isUndocking when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsUndocking(false);
    }
  }, [isOpen]);

  // Event handlers for clicks
  useEffect(() => {
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
  }, [isOpen, onOpenChange]);

  // Audience options
  const audienceOptions = [
    { value: "students_only", label: "Students Only" },
    { value: "guests_only", label: "Guests Only" },
    { value: "both", label: "Students & Guests" },
  ];

  // Handle dialog close
  const handleClose = useCallback(() => {
    // Reset dock state when closing
    if (isDocked) {
      setIsDocked(false);
      onDockStateChange(false);
    }
    onOpenChange(false);
  }, [isDocked, onDockStateChange, onOpenChange]);

  // Don't render when closed
  if (!isOpen) return null;

  return (
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="event-dialog"
      unmountOnExit
    >
      <div className="fixed inset-0 z-40" style={{ pointerEvents: "none" }}>
        <motion.div
          ref={dialogRef}
          className={`event-dialog${isDocked ? " event-dialog--docked" : " event-dialog--undocked"}`}
          style={{
            pointerEvents: "auto",
            zIndex: isDocked ? 30 : 50,
          }}
        >
          <div className={`event-dialog__container${isDocked ? " event-dialog__container--docked" : " event-dialog__container--undocked"}`}>
            <div className="event-dialog__header">
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
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            <div className="event-dialog__content custom-scrollbar">
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

            <div className="event-dialog__footer">
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
                    onClick={handleClose}
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
    </CSSTransition>
  );
};

export default EventDialog;
