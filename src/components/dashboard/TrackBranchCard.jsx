import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MapPin, Calendar, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

const TrackBranchCard = () => {
  const { studentTrack } = useUser();
  // Handle loading or no data state
  if (!studentTrack) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading track information...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate graduation date and days remaining correctly
  const calculateDaysRemaining = () => {
    const startDate = new Date(studentTrack.track.start_date);
    const graduationDate = new Date(startDate);

    // If intensive, add 4 months, otherwise add 9 months
    if (studentTrack.track.program_type === "intensive") {
      graduationDate.setMonth(startDate.getMonth() + 4);
    } else {
      graduationDate.setMonth(startDate.getMonth() + 9);
    }

    // Calculate days remaining (graduation date - current date)
    const today = new Date();
    const remainingTime = graduationDate - today;
    return Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <>
      <div className="flex flex-col gap-3 md:gap-4 lg:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-4">
          <div className="bg-primary/10 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 dark:bg-primary/20">
            <div className="bg-primary/20 p-2 sm:p-2.5 rounded-full text-primary flex-shrink-0 dark:bg-primary/30 dark:text-primary-foreground">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <p className="text-base sm:text-lg font-semibold text-primary truncate pr-2 dark:text-primary-foreground">
                    {studentTrack.track.name}
                  </p>
                </div>
                <span className="bg-primary/20 px-2 py-0.5 rounded-full text-xs font-medium text-primary self-start dark:bg-primary/30 dark:text-primary-foreground">
                  Intake{" "}
                  {studentTrack.intake || studentTrack.track.intake || ""}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-100/50 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 dark:bg-blue-900/30">
            <div className="bg-blue-100 p-2 sm:p-2.5 rounded-full text-blue-600 flex-shrink-0 dark:bg-blue-900/50 dark:text-blue-300">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-semibold text-blue-700 truncate dark:text-blue-300">
                {studentTrack.branch?.name}
              </p>
            </div>
          </div>

          {/* Card showing join date and graduation countdown */}
          <div className="bg-amber-100/50 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 sm:col-span-2 lg:col-span-2 dark:bg-amber-900/30">
            <div className="bg-amber-100 p-2 sm:p-2.5 rounded-full text-amber-600 flex-shrink-0 dark:bg-amber-900/50 dark:text-amber-300">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                You joined on {studentTrack.track.start_date}
              </p>
              <p className="text-base sm:text-lg font-semibold text-amber-700 dark:text-amber-300">
                {daysRemaining > 0 ? (
                  <>
                    <span className="text-xl sm:text-2xl font-bold text-amber-600 bg-amber-200/70 px-3 py-1 rounded-md inline-block mr-2 shadow-sm dark:text-amber-200 dark:bg-amber-900/70">
                      {daysRemaining}
                    </span>
                    days left until graduation
                  </>
                ) : (
                  "Congratulations! You are almost graduated."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default TrackBranchCard;
