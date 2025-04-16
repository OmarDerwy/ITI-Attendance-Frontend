import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Check, Video, Users, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { axiosBackendInstance } from '@/api/config';
import { format, isToday, isFuture, parseISO, isAfter, isBefore, addDays, getHours, getMinutes } from 'date-fns';
import AbsenceWarningCard from '@/components/dashboard/AbsenceWarningCard';

const CombinedScheduleCard = ({ attendanceData = { present: 0, absent: 0, totalDays: 0 }, maxAbsenceLimit = 5 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClassesByDay, setUpcomingClassesByDay] = useState({});
  const [upcomingDays, setUpcomingDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const { studentTrack } = useUser();
  
  // Color variables to match Schedule.jsx and StudentSchedule.jsx
  const onlineForeground = "rgb(254, 230, 231)";
  const offlineForeground = "hsl(var(--accent-foreground))"; 
  const offlineTextClass = "text-primary-foreground";
  const onlineTextClass = "text-accent-foreground";

  useEffect(() => {
    if (studentTrack) {
      fetchScheduleData(studentTrack.track.id);
    } else {
      setIsLoading(false);
    }
  }, [studentTrack]);

  const fetchScheduleData = async (trackId) => {
    try {
      const response = await axiosBackendInstance.get(
        `attendance/sessions/calendar-data/?track_id=${trackId}`
      );
      
      const currentTime = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Process events for today and upcoming days
      const allEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,
        instructor: event.instructor,
        start: parseISO(event.start),
        end: parseISO(event.end),
        isOnline: event.is_online,
        branch: event.branch,
      }));
      
      // Filter today's classes
      const todayEvents = allEvents.filter(event => isToday(event.start));
      
      // Determine status for today's classes
      const processedTodayEvents = todayEvents.map(event => {
        let status = "upcoming";
        if (isBefore(event.end, currentTime)) {
          status = "completed";
        } else if (isAfter(event.end, currentTime) && isBefore(event.start, currentTime)) {
          status = "active";
        }
        
        return {
          ...event,
          time: `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`,
          status
        };
      });
      
      // Sort today's events by start time
      processedTodayEvents.sort((a, b) => a.start - b.start);
      
      // Create time slots for the schedule grid (9am to 6pm)
      const slots = [];
      for (let hour = 9; hour <= 18; hour++) {
        slots.push(`${hour}:00`);
      }
      setTimeSlots(slots);
      
      // Filter upcoming classes (next 6 days)
      const nextDays = new Date(today);
      nextDays.setDate(nextDays.getDate() + 6);
      
      const upcomingEvents = allEvents.filter(event => 
        isAfter(event.start, currentTime) && 
        isBefore(event.start, nextDays)
      );
      
      // Group upcoming events by day
      const eventsByDay = {};
      const daysList = [];
      
      // Create array of next 6 days for display, starting from tomorrow (days 2-7)
      for (let i = 1; i < 7; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayInfo = {
          date: date,
          dateStr: dateStr,
          formattedDate: format(date, 'EEE, MMM d'),
          isTomorrow: i === 1,
          displayName: i === 1 ? 'Tomorrow' : format(date, 'EEEE')
        };
        daysList.push(dayInfo);
        eventsByDay[dateStr] = [];
      }
      
      // Populate events by day
      upcomingEvents.forEach(event => {
        const dateStr = format(event.start, 'yyyy-MM-dd');
        if (eventsByDay[dateStr]) {
          eventsByDay[dateStr].push({
            ...event,
            time: `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`,
            startHour: getHours(event.start),
            startMinute: getMinutes(event.start),
            endHour: getHours(event.end),
            endMinute: getMinutes(event.end)
          });
        }
      });
      
      // Sort events within each day
      Object.keys(eventsByDay).forEach(date => {
        eventsByDay[date].sort((a, b) => a.start - b.start);
      });
      
      setTodayClasses(processedTodayEvents);
      setUpcomingClassesByDay(eventsByDay);
      setUpcomingDays(daysList);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setIsLoading(false);
    }
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="pt-6 flex justify-center items-center" style={{ minHeight: "300px" }}>
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading your schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Today's Schedule Card - removed gradient */}
      <Card className="overflow-hidden lg:col-span-1 border-l-4 border-l-primary">
        <CardContent className="pt-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-primary"  />
              <div>
                <CardTitle className="text-2xl text-black-800">Today's Classes</CardTitle>
                <p className="text-sm text- italic">{format(new Date(), 'EEEE, MMMM d')}</p>
              </div>
            </div>
            <Link to="/student-schedule" className="text-sm text-primary hover:text-primary/80 flex items-center font-medium">
              Full Schedule <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-3 mt-4">
            {todayClasses.length > 0 ? (
              todayClasses.map((cls) => (
                <div 
                  key={cls.id} 
                  className={cn(
                    "p-4 rounded-lg border relative overflow-hidden",
                    cls.status === "completed" && "bg-gray-50 border-gray-200",
                    cls.status === "active" && "bg-accent border-primary/20 shadow-sm",
                    cls.status === "upcoming" && "bg-white border-primary/10"
                  )}
                >
                  {/* Left border status indicator */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5",
                    cls.status === "completed" && "bg-gray-400",
                    cls.status === "active" && "bg-primary",
                    cls.status === "upcoming" && "bg-primary/60"
                  )}></div>
                  
                  {/* Status badge */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-base pl-2 text-gray-800">{cls.title}</h3>
                    {cls.status === "completed" && (
                      <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium flex items-center border border-gray-200">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Completed
                      </span>
                    )}
                    
                    {cls.status === "active" && (
                      <span className="px-2.5 py-1 text-xs bg-primary/10 text-primary-foreground rounded-full font-medium flex items-center border border-primary/20">
                        <span className="h-2 w-2 rounded-full bg-primary mr-1.5 animate-pulse"></span>
                        In Progress
                      </span>
                    )}
                    
                    {cls.status === "upcoming" && (
                      <span className="px-2.5 py-1 text-xs bg-white text-primary rounded-full font-medium flex items-center border border-primary/10">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Coming Next
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 pl-2 mt-3">
                    <div className={cn(
                      "flex items-center gap-1.5",
                      cls.status === "completed" ? "text-gray-500" : "text-gray-700"
                    )}>
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{cls.time}</span>
                    </div>
                    
                    <div className={cn(
                      "flex items-center gap-1.5",
                      cls.status === "completed" ? "text-gray-500" : "text-gray-700"
                    )}>
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{cls.instructor}</span>
                    </div>
                    
                    {cls.isOnline ? (
                      <div className="flex items-center gap-1.5 text-sm text-accent-foreground">
                        <Video className="h-4 w-4" />
                        <span>Online</span>
                      </div>
                    ) : cls.branch && (
                      <div className="flex items-center gap-1.5 text-sm text-primary">
                        <MapPin className="h-4 w-4" />
                        <span>{cls.branch.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-accent/50 rounded-lg border border-dashed border-primary/20">
                <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-3">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <p className="text-base text-primary-foreground">No classes scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid Card - Simplified Version */}
      <Card className="overflow-hidden h-full lg:col-span-1">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Weekly Schedule</CardTitle>
            </div>
            <Link to="/student-schedule" className="text-xs text-primary flex items-center hover:text-primary/80">
              View Full Schedule <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          
          {/* Simplified schedule layout - day rows with sequential sessions */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[500px]">
              {/* Days and sessions */}
              <div className="border rounded-md">
                {upcomingDays.map((day, dayIndex) => {
                  const events = upcomingClassesByDay[day.dateStr] || [];
                  return (
                    <div 
                      key={day.dateStr} 
                      className={cn(
                        "flex border-b last:border-b-0",
                        day.isToday && "bg-muted/5"
                      )}
                    >
                      {/* Day cell */}
                      <div className={cn(
                        "w-[90px] p-2 border-r flex flex-col justify-center shrink-0",
                        day.isToday && "font-bold text-primary"
                      )}>
                        <div className="text-sm">{day.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(day.date, 'MMM d')}
                        </div>
                      </div>
                      
                      {/* Sessions for this day - Updated color scheme */}
                      <div className="flex-1 p-2 flex gap-2 flex-wrap">
                        {events.length > 0 ? events.map((event, eventIndex) => {
                          const isOnline = Boolean(event.isOnline);
                          const textColorClass = isOnline ? onlineTextClass : offlineTextClass;
                          
                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "rounded-md border text-xs py-1 px-2 flex-grow-0 flex-shrink-0",
                                "max-w-[160px] min-w-[100px]",
                                textColorClass,
                                "transition-all hover:shadow-md"
                              )}
                              style={{ 
                                backgroundColor: isOnline ? onlineForeground : offlineForeground 
                              }}
                            >
                              <div className="font-medium truncate text-sm">
                                {event.title}
                              </div>
                              <div className="text-[10px] opacity-90 mt-1">
                                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                              </div>
                              <div className="text-[10px] opacity-90 truncate">
                                {event.instructor}
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-xs text-muted-foreground py-3 italic">
                            No classes scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AbsenceWarningCard added here */}
      <div className="lg:col-span-1 h-full">
        <AbsenceWarningCard
          absent={attendanceData.absent}
          maxAbsenceLimit={maxAbsenceLimit}
        />
      </div>
    </div>
  );
};

export default CombinedScheduleCard;
