
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, BookOpen, Video, Users } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const UpcomingScheduleCard = () => {
  // Mock data - in a real application, this would come from an API
  const upcomingClasses = [
    {
      id: 1,
      title: "React Hooks & State Management",
      date: "Tomorrow, 9:00 AM - 11:00 AM",
      instructor: "Dr. Ahmed Hassan",
      isOnline: false,
      day: "Tomorrow"
    },
    {
      id: 2,
      title: "Advanced CSS Techniques",
      date: "May 12, 2:00 PM - 4:00 PM",
      instructor: "Eng. Sara Mahmoud",
      isOnline: true,
      day: "Thursday"
    },
    {
      id: 3,
      title: "RESTful API Design",
      date: "May 13, 10:00 AM - 12:00 PM",
      instructor: "Dr. Mohamed Ali",
      isOnline: false,
      day: "Friday"
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Upcoming Schedule</CardTitle>
          <Link to="/student-schedule" className="text-sm text-primary flex items-center">
            View Full Schedule <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {upcomingClasses.map((cls) => (
            <div 
              key={cls.id} 
              className={cn(
                "p-4 rounded-lg border",
                cls.isOnline 
                  ? "bg-gradient-to-r from-blue-50 to-transparent border-blue-100"
                  : "bg-gradient-to-r from-emerald-50 to-transparent border-emerald-100"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{cls.title}</h3>
                    {cls.isOnline ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                        <MapPin className="h-3 w-3 mr-1" />
                        Offline
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      <span className="font-medium mr-2">{cls.day}:</span>
                      {cls.date}
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

export default UpcomingScheduleCard;
