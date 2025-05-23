// EventValidation.js

export class EventValidation {
  /**
   * Checks if the event title is valid (non-empty)
   */
  static validateTitle(title) {
    return !!title && title.trim().length > 0;
  }

  /**
   * Checks if the start date is before the end date
   */
  static validateDateOrder(start, end) {
    return new Date(start) < new Date(end);
  }

  /**
   * Checks if a date is in the past (before today)
   */
  static isDateInPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  /**
   * Checks if a sub-event is within its parent event's bounds
   */
  static isWithinParentBounds(event, newStart, newEnd, events) {
    if (!event.parentId) return true;
    const parentEvent = events.find(
      (e) => String(e.id) === String(event.parentId)
    );
    if (!parentEvent) return true;
    const parentStart = new Date(parentEvent.start);
    const parentEnd = new Date(parentEvent.end);
    return newStart >= parentStart && newEnd <= parentEnd;
  }

  /**
   * Validates all event fields and returns an error message or null
   */
  static validateEvent({ eventData, isSubEvent, parentEvent, events }) {
    if (!this.validateTitle(eventData.title)) {
      return "Title is required.";
    }
    if (!this.validateDateOrder(eventData.start, eventData.end)) {
      return "Start time must be before end time.";
    }
    if (this.isDateInPast(eventData.start)) {
      return "Cannot add events to past dates";
    }
    // Check parent bounds for sub-events
    if (isSubEvent || eventData.parentId) {
      const parent = parentEvent || events?.find(
        (e) => String(e.id) === String(eventData.parentId)
      );
      if (parent) {
        const parentStart = new Date(parent.start);
        const parentEnd = new Date(parent.end);
        const startDate = new Date(eventData.start);
        const endDate = new Date(eventData.end);
        if (startDate < parentStart || endDate > parentEnd) {
          return "Sub-events must stay within the time bounds of their parent event";
        }
      }
    }
    return null;
  }
} 