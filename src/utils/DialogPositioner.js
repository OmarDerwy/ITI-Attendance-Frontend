/**
 * Utility for handling dialog positioning, docking, and transitions
 */

/**
 * Position a dialog based on its docking state and click position
 * 
 * @param {Object} params Configuration parameters
 * @param {React.RefObject} params.dialogRef Reference to the dialog element
 * @param {boolean} params.isDocked Whether the dialog is docked
 * @param {boolean} params.isOpen Whether the dialog is open
 * @param {Object} params.position Click position {x, y}
 * @param {Object} params.lastUndockedPosition Last position before docking
 * @param {boolean} params.isUndocking Whether we're transitioning from docked to undocked
 * @param {Object} params.currentEvent Current event data (for time-based positioning)
 * @returns {void}
 */
export const positionDialog = ({
  dialogRef,
  isDocked,
  isOpen,
  position,
  lastUndockedPosition,
  isUndocking,
  currentEvent,
}) => {
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
  const eventTime = new Date(currentEvent?.start || new Date());
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
  dialog.style.width = "360px"; // Reset width to default

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
};

/**
 * Save the current position of a dialog before docking
 * 
 * @param {React.RefObject} dialogRef Reference to the dialog element
 * @returns {Object|null} Position data or null if dialog ref is invalid
 */
export const saveDialogPosition = (dialogRef) => {
  if (!dialogRef.current) return null;
  
  const rect = dialogRef.current.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
};

/**
 * Set up event handlers for dialog interactions
 * 
 * @param {Object} params Configuration parameters
 * @param {boolean} params.isOpen Whether the dialog is open
 * @param {React.RefObject} params.dialogRef Reference to the dialog element
 * @param {Function} params.onOpenChange Callback to change open state
 * @param {Function} params.positionCallback Callback to position the dialog
 * @returns {Function} Cleanup function
 */
export const setupDialogEventHandlers = ({
  isOpen,
  dialogRef,
  onOpenChange,
  positionCallback,
}) => {
  // Position dialog whenever it opens or docking changes
  positionCallback();

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

  // Return cleanup function
  return () => {
    document.removeEventListener("contextmenu", handleRightClick);
    document.removeEventListener("mousedown", handleClickOutside);
  };
};