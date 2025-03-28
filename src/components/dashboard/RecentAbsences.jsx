
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar } from 'lucide-react';

const RecentAbsences = ({ absences = [], onViewAll }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Recent Absences</CardTitle>
          <Link to="/attendance-reports" className="text-sm text-primary flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CardDescription>Latest student absences reported</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {absences.map((absence) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAbsences;
