
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Check, Video, Users } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const TodayScheduleCard = () => {
  // Mock data for today's schedule
  const todayClasses = [
    {
      id: 1,
      title: "Web Development",
      time: "09:00 - 11:00",
      instructor: "Dr. Ahmed Hassan",
      isOnline: false,
      status: "completed" // completed, active, upcoming
    },
    {
      id: 2,
      title: "Data Structures",
      time: "11:30 - 13:30",
      instructor: "Eng. Khaled Mohamed",
      isOnline: false,
      status: "active"
    },
    {
      id: 3,
      title: "Database Systems",
      time: "14:00 - 16:00",
      instructor: "Dr. Nada Ibrahim",
      isOnline: true,
      status: "upcoming"
    }
  ];

  // Calculate day progress
  const currentTime = new Date();
  const startOfDay = new Date(currentTime);
  startOfDay.setHours(8, 0, 0, 0);
  const endOfDay = new Date(currentTime);
  endOfDay.setHours(17, 0, 0, 0);
  
  const totalDayDuration = endOfDay - startOfDay;
  const elapsedTime = currentTime - startOfDay;
  const dayProgressPercentage = Math.min(100, Math.max(0, (elapsedTime / totalDayDuration) * 100));

  return (
    <Card className="border-l-4 border-l-primary overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">Wednesday, May 10</p>
            </div>
          </div>
          <Link to="/student-schedule" className="text-sm text-primary flex items-center">
            View Full Schedule <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {todayClasses.map((cls) => (
            <div 
              key={cls.id} 
              className={cn(
                "p-4 rounded-lg border relative overflow-hidden",
                cls.status === "completed" && "bg-muted/30 border-muted",
                cls.status === "active" && "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20",
                cls.status === "upcoming" && (cls.isOnline 
                  ? "bg-gradient-to-r from-blue-50 to-transparent border-blue-100"
                  : "bg-gradient-to-r from-emerald-50 to-transparent border-emerald-100")
              )}
            >
              {/* Status indicator on the left */}
              {cls.status === "active" && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-medium",
                      cls.status === "completed" && "text-muted-foreground"
                    )}>{cls.title}</h3>
                    
                    {cls.status === "completed" && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    )}
                    
                    {cls.status === "active" && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1 animate-pulse"></span>
                        In Progress
                      </span>
                    )}
                    
                    {cls.isOnline && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center">
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-2" />
                      {cls.time}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5 mr-2" />
                      {cls.instructor}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayScheduleCard;
