import React, { useEffect, useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, ArrowRight, ArrowLeft, Edit, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import SimpleTimePicker from "./SimpleTimePicker";
import { motion } from "framer-motion";
import { positionDialog, saveDialogPosition } from "@/utils/DialogPositioner";
import "./EventDialog.css";
import { CSSTransition } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-hot-toast";

class DialogManager {
  constructor(dialogRef) {
    this.dialogRef = dialogRef;
  }

  positionDialog(isDocked, isOpen, position, lastUndockedPosition, isUndocking, currentEvent) {
    positionDialog({
      dialogRef: this.dialogRef,
      isDocked,
      isOpen,
      position,
      lastUndockedPosition,
      isUndocking,
      currentEvent,
    });
  }

  savePosition() {
    return saveDialogPosition(this.dialogRef);
  }
}

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
  const [dialogManager] = useState(() => new DialogManager(dialogRef));
  const [isDocked, setIsDocked] = useState(false);
  const [lastUndockedPosition, setLastUndockedPosition] = useState(null);
  const [isUndocking, setIsUndocking] = useState(false);
  const [isSubEvent, setIsSubEvent] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentEvent = selectedEvent || newEvent || {};
  const currentParentEvent =
    parentEvent ||
    (isSubEvent && selectedEvent?.parentId
      ? { start: parentEvent?.start, end: parentEvent?.end }
      : null);

  // Add isViewOnly check
  const isViewOnly = selectedEvent?.isPastEvent;

  // Position the dialog using the utility function
  const handlePositionDialog = useCallback(() => {
    dialogManager.positionDialog(
      isDocked,
      isOpen,
      position,
      lastUndockedPosition,
      isUndocking,
      currentEvent
    );
    
    if (isUndocking) {
      setTimeout(() => {
        setIsUndocking(false);
      }, 300);
    }
  }, [isDocked, isOpen, position, lastUndockedPosition, isUndocking, currentEvent, dialogManager]);

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

    if (newDockedState && dialogRef.current) {
      setLastUndockedPosition(dialogManager.savePosition());
    }

    if (!newDockedState) {
      setIsUndocking(true);
    } else {
      setIsUndocking(false);
    }

    setIsDocked(newDockedState);

    setTimeout(() => {
      onDockStateChange(newDockedState);
    }, 50);
  }, [isDocked, onDockStateChange, dialogManager]);

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

  // Update the session editing logic
  const handleEditSession = (session) => {
    // Ensure we're working with string IDs
    const sessionWithStringId = {
      ...session,
      id: String(session.id)
    };
    setEditingSession(sessionWithStringId);
    setIsAddingSession(true);
  };


  const handleAddSession = () => {
    const newSession = {
      id: "react" + uuidv4(),
      title: "",
      description: "",
      start: currentEvent.start,
      end: currentEvent.end,
      parentId: currentEvent.id,
      speaker: "",
    };
    setEditingSession(newSession);
    setIsAddingSession(true);
  };

  // Handle save with loading state
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSubmit();
    } finally {
      setIsSaving(false);
    }
  };

  // Handle session save with loading state
  const handleSaveSession = async () => {
    if (!editingSession.title) {
      toast.error("Session title is required");
      return;
    }

    try {
      setIsSaving(true);
      if (selectedEvent) {
        // Update existing event's sessions
        const updatedSessions = selectedEvent.sessions || [];
        const sessionIndex = updatedSessions.findIndex(s => s.id === editingSession.id);

        if (sessionIndex === -1) {
          // New session
          updatedSessions.push(editingSession);
        } else {
          // Update existing session
          updatedSessions[sessionIndex] = editingSession;
        }

        onEventUpdate("sessions", updatedSessions);
      } else {
        // Add session to new event
        const updatedSessions = newEvent.sessions || [];
        const sessionIndex = updatedSessions.findIndex(s => s.id === editingSession.id);

        if (sessionIndex === -1) {
          // New session
          updatedSessions.push(editingSession);
        } else {
          // Update existing session
          updatedSessions[sessionIndex] = editingSession;
        }

        onNewEventChange({ ...newEvent, sessions: updatedSessions });
      }

      setIsAddingSession(false);
      setEditingSession(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = (sessionId) => {
    const updatedSessions = (currentEvent.sessions || []).filter(s => s.id !== sessionId);
    onEventUpdate("sessions", updatedSessions);
  };

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
                  ? isViewOnly
                    ? "View Event"
                    : "Edit Event"
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
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={selectedEvent ? selectedEvent.title : newEvent.title}
                    onChange={(e) =>
                      selectedEvent
                        ? onEventUpdate("title", e.target.value)
                        : onNewEventChange({
                            ...newEvent,
                            title: e.target.value,
                          })
                    }
                    placeholder="Enter event title"
                    className="w-full"
                    disabled={isViewOnly}
                  />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={
                      selectedEvent
                        ? selectedEvent.description
                        : newEvent.description
                    }
                    onChange={(e) =>
                      selectedEvent
                        ? onEventUpdate("description", e.target.value)
                        : onNewEventChange({
                            ...newEvent,
                            description: e.target.value,
                          })
                    }
                    className="min-h-[80px] resize-y w-full"
                    placeholder="Enter event description"
                    disabled={isViewOnly}
                  />
                </div>

                {(isSubEvent || (selectedEvent && selectedEvent.parentId)) && (
                  <div className="space-y-2">
                    <Label htmlFor="speaker">Speaker</Label>
                    <Input
                      id="speaker"
                      value={
                        selectedEvent
                          ? selectedEvent.speaker || ""
                          : newEvent.speaker || ""
                      }
                      onChange={(e) =>
                        selectedEvent
                          ? onEventUpdate("speaker", e.target.value)
                          : onNewEventChange({
                              ...newEvent,
                              speaker: e.target.value,
                            })
                      }
                      placeholder="Enter speaker name"
                      disabled={isViewOnly}
                    />
                  </div>
                )}

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
                            disabled={isViewOnly}
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
                          disabled={isViewOnly}
                        />
                        Mandatory Attendance
                      </Label>
                      <p className="text-xs text-gray-500">
                        Mark this event as mandatory for the selected audience
                      </p>
                    </div>

                    {/* Target Tracks - Only show if not guest_only */}
                    {currentEvent.audience_type !== "guests_only" && (
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
                                disabled={isViewOnly}
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
                    )}
                  </>
                )}

                {/* Time Selection for Sub-events */}
                {isSubEvent && (
                  <div >
                    <h3 className="text-sm font-medium mb-2">Time Selection</h3>
                    <SimpleTimePicker
                      parentEvent={currentParentEvent}
                      value={currentEvent}
                      onChange={handleTimeRangeChange}
                      disabled={isViewOnly}
                    />
                  </div>
                )}

                {/* Sessions Section */}
                {!isSubEvent && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Sessions</Label>
                      {!isAddingSession && !isViewOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddSession}
                          className="h-8"
                        >
                          Add Session
                        </Button>
                      )}
                    </div>

                    {/* Session Form */}
                    {isAddingSession && !isViewOnly && (
                      <div className="border rounded-md p-3 bg-muted/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm">
                            {String(editingSession?.id || '').startsWith("react") ? "New Session" : "Edit Session"}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsAddingSession(false);
                              setEditingSession(null);
                            }}
                            className="h-6 w-6"
                          >
                            <X size={14} />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="session-title">Title</Label>
                          <Input
                            id="session-title"
                            value={editingSession.title}
                            onChange={(e) =>
                              setEditingSession(prev => ({
                                ...prev,
                                title: e.target.value
                              }))
                            }
                            placeholder="Enter session title"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="session-speaker">Speaker</Label>
                          <Input
                            id="session-speaker"
                            value={editingSession.speaker}
                            onChange={(e) =>
                              setEditingSession(prev => ({
                                ...prev,
                                speaker: e.target.value
                              }))
                            }
                            placeholder="Enter speaker name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Time Selection</Label>
                          <SimpleTimePicker
                            parentEvent={currentEvent}
                            value={editingSession}
                            onChange={(timeRange) =>
                              setEditingSession(prev => ({
                                ...prev,
                                start: timeRange.start,
                                end: timeRange.end
                              }))
                            }
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingSession(false);
                              setEditingSession(null);
                            }}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveSession}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Session"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sessions List */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                      {(selectedEvent?.sessions || newEvent?.sessions || [])?.map((session) => (
                        <div
                          key={session.id}
                          className="flex flex-col space-y-1 p-2 bg-primary/5 rounded border border-primary/20"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{session.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(session.start_time || session.start).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -
                                {new Date(session.end_time || session.end).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              {session.speaker && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Speaker: {session.speaker}
                                </div>
                              )}
                            </div>
                            {!isViewOnly && (
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEditSession(session)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive/80"
                                  onClick={() => handleDeleteSession(session.id)}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!selectedEvent?.sessions?.length && !newEvent?.sessions?.length) && (
                        <div className="text-sm text-muted-foreground py-2 text-center">
                          No sessions added yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="event-dialog__footer">
              <div className="flex justify-between items-center">
                {selectedEvent && !isViewOnly && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete(selectedEvent.id);
                      handleClose();
                    }}
                    className="h-9"
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                )}
                <div
                  className={`${
                    selectedEvent && !isViewOnly ? "" : "w-full"
                  } flex justify-end space-x-2`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    className="h-9"
                    disabled={isSaving}
                  >
                    {isViewOnly ? "Close" : "Cancel"}
                  </Button>
                  {!isViewOnly && (
                    <Button 
                      size="sm" 
                      onClick={handleSave} 
                      className="h-9"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {selectedEvent ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        selectedEvent ? "Update Event" : "Add Event"
                      )}
                    </Button>
                  )}
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
