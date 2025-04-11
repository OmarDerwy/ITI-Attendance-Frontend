import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

const TrackBranchCard = () => {
  // Mock data - in a real application, this would come from an API or context
  const studentInfo = {
    track: "Web Development & UI Design",
    branch: "Smart Village",
    cohort: "Winter 2023",
    startDate: "January 15, 2023",
    endDate: "July 15, 2023"
  };

  // Calculate days remaining until graduation
  const endDate = new Date(studentInfo.endDate);
  const today = new Date();
  const daysRemaining = differenceInDays(endDate, today);
  
  // Format the join date for display
  const formattedJoinDate = new Date(studentInfo.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
        <div className="flex flex-col gap-3 md:gap-4 lg:gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-4">
            <div className="bg-primary/10 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3">
              <div className="bg-primary/20 p-2 sm:p-2.5 rounded-full text-primary flex-shrink-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-semibold text-primary truncate">{studentInfo.track}</p>
              </div>
            </div>
            
            <div className="bg-blue-100/50 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-100 p-2 sm:p-2.5 rounded-full text-blue-600 flex-shrink-0">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-semibold text-blue-700 truncate">{studentInfo.branch}</p>
              </div>
            </div>
            
            {/* New card showing join date and graduation countdown */}
            <div className="bg-amber-100/50 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 sm:col-span-2 lg:col-span-2">
              <div className="bg-amber-100 p-2 sm:p-2.5 rounded-full text-amber-600 flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-amber-700">You joined on {formattedJoinDate}</p>
                <p className="text-base sm:text-lg font-semibold text-amber-700">
                  {daysRemaining > 0 
                    ? `${daysRemaining} days left until graduation`
                    : "Congratulations on your graduation!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackBranchCard;
