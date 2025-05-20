import React, { useState, useEffect, useRef } from 'react';
import { format, addMinutes, parseISO } from 'date-fns';

const VisualEventTimePicker = ({ parentEvent, value, onChange }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'start', 'end', or 'move'
  const [initialPos, setInitialPos] = useState(null);
  const [initialTime, setInitialTime] = useState({ start: null, end: null });

  if (!parentEvent || !parentEvent.start || !parentEvent.end) {
    return <div className="text-red-500">Parent event times not available</div>;
  }

  const parentStart = new Date(parentEvent.start);
  const parentEnd = new Date(parentEvent.end);
  const parentDuration = parentEnd - parentStart;
  
  // Get current event times or default to centered in parent
  const currentStart = value.start ? new Date(value.start) : 
    new Date(parentStart.getTime() + parentDuration * 0.25);
  const currentEnd = value.end ? new Date(value.end) : 
    new Date(parentStart.getTime() + parentDuration * 0.75);

  // Calculate positions as percentages
  const startPct = Math.max(0, Math.min(100, ((currentStart - parentStart) / parentDuration) * 100));
  const endPct = Math.max(0, Math.min(100, ((currentEnd - parentStart) / parentDuration) * 100));
  const durationPct = endPct - startPct;

  // Format times for display
  const formatTimeDisplay = (date) => {
    return format(date, 'h:mm a');
  };

  // Handle mouse down on different parts
  const handleMouseDown = (e, type) => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setInitialPos(e.clientX);
    setInitialTime({
      start: new Date(currentStart),
      end: new Date(currentEnd)
    });
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const movementPct = ((e.clientX - initialPos) / containerWidth) * 100;
    const timeMovement = (movementPct / 100) * parentDuration;
    
    let newStart = new Date(initialTime.start);
    let newEnd = new Date(initialTime.end);
    
    // Apply changes based on drag type
    if (dragType === 'start') {
      newStart = new Date(initialTime.start.getTime() + timeMovement);
      // Ensure start doesn't go past end or parent bounds
      if (newStart >= newEnd) newStart = new Date(newEnd.getTime() - 15 * 60000); // At least 15 min duration
      if (newStart < parentStart) newStart = new Date(parentStart);
    } else if (dragType === 'end') {
      newEnd = new Date(initialTime.end.getTime() + timeMovement);
      // Ensure end doesn't go before start or parent bounds
      if (newEnd <= newStart) newEnd = new Date(newStart.getTime() + 15 * 60000); // At least 15 min duration
      if (newEnd > parentEnd) newEnd = new Date(parentEnd);
    } else if (dragType === 'move') {
      // Move entire event
      const duration = initialTime.end - initialTime.start;
      newStart = new Date(initialTime.start.getTime() + timeMovement);
      newEnd = new Date(newStart.getTime() + duration);
      
      // Ensure within parent bounds
      if (newStart < parentStart) {
        newStart = new Date(parentStart);
        newEnd = new Date(newStart.getTime() + duration);
      }
      if (newEnd > parentEnd) {
        newEnd = new Date(parentEnd);
        newStart = new Date(newEnd.getTime() - duration);
      }
    }
    
    // Round to 5-minute intervals for better UX
    const roundToFiveMin = (date) => {
      const minutes = date.getMinutes();
      const roundedMin = Math.round(minutes / 5) * 5;
      const newDate = new Date(date);
      newDate.setMinutes(roundedMin);
      return newDate;
    };
    
    newStart = roundToFiveMin(newStart);
    newEnd = roundToFiveMin(newEnd);
    
    // Update if values changed
    if (newStart.getTime() !== currentStart.getTime() || 
        newEnd.getTime() !== currentEnd.getTime()) {
      onChange({
        start: newStart.toISOString(),
        end: newEnd.toISOString()
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
    setInitialPos(null);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, initialPos, initialTime, dragType]);

  return (
    <div className="space-y-4">
      <div className="text-sm">
        <div className="flex justify-between mb-1">
          <div>Parent: {formatTimeDisplay(parentStart)} - {formatTimeDisplay(parentEnd)}</div>
          <div>Duration: {format(currentEnd - currentStart, 'h:mm')}</div>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="h-16 bg-gray-100 rounded relative cursor-pointer border"
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* Parent event timeline */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 text-xs text-gray-500">
          <span>{formatTimeDisplay(parentStart)}</span>
          <span>{formatTimeDisplay(parentEnd)}</span>
        </div>
        
        {/* Sub event indicator */}
        <div 
          className="absolute top-0 bottom-0 bg-blue-500 rounded opacity-70"
          style={{ 
            left: `${startPct}%`, 
            width: `${durationPct}%` 
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, 'move');
          }}
        >
          <div className="h-full flex items-center justify-center text-white text-xs font-medium">
            {formatTimeDisplay(currentStart)} - {formatTimeDisplay(currentEnd)}
          </div>
          
          {/* Drag handles */}
          <div 
            className="absolute inset-y-0 left-0 w-2 bg-blue-700 rounded-l cursor-ew-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, 'start');
            }}
          />
          <div 
            className="absolute inset-y-0 right-0 w-2 bg-blue-700 rounded-r cursor-ew-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, 'end');
            }}
          />
        </div>
      </div>
      
      <div className="text-sm text-center text-gray-500">
        Drag to position • Drag edges to resize
      </div>
    </div>
  );
};

export default VisualEventTimePicker;