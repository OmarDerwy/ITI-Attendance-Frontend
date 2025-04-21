import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RecentAbsences = ({ absences = [], onViewAll, selectedTrack, onTrackChange, tracks }) => {
  // Limit to 3 absences
  const limitedAbsences = absences.slice(0, 3);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Recent Absences</CardTitle>
          <div className="flex items-center gap-4">
            <Select
              value={selectedTrack}
              onValueChange={onTrackChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                {tracks?.map((track) => (
                  <SelectItem key={track.id} value={track.id.toString()}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/attendance-status" className="text-sm text-primary flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        <CardDescription>Latest student absences reported</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {limitedAbsences?.length > 0 ? (
            limitedAbsences.map((absence) => (
              <div key={absence.id} className="flex justify-between items-start border-b pb-3">
                <div>
                  <p className="font-medium">{absence.student}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{absence.date}</span>
                  </div>
                  <p className="text-xs mt-1">{absence.reason}</p>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    absence.status === "excused" 
                      ? "bg-green-50 text-green-700" 
                      : absence.status === "pending" 
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                    {absence.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No recent absences found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAbsences;