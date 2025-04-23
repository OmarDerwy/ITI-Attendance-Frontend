import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, Shield, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';

const AbsenceWarningCard = ({ compact = false }) => {
  const { attendanceStats } = useUser();
  const maxAllowedAbsences = attendanceStats?.thresholds.unexcused_threshold + attendanceStats?.thresholds.excused_threshold;
  
  // Calculate percentage for excused absences
  const excusedPercentage = Math.round((attendanceStats?.excused_absences / attendanceStats?.thresholds.excused_threshold) * 100) || 0;
  
  const status = attendanceStats?.attendance_status?.toLowerCase() || 'good';
  
  // Status-based configuration
  const statusConfig = {
    good: {
      icon: Shield,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconColor: "text-green-600",
      note: "Your attendance is in good standing!"
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      iconColor: "text-yellow-600",
      note: "Be careful! You're approaching the absence limit."
    },
    danger: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      iconColor: "text-red-600",
      note: "Warning! You've exceeded the recommended absence limit."
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.good;
  const StatusIcon = currentStatus.icon;
  
  // Simplified - no background colors
  const progressBarColors = {
    danger: "bg-red-500",
    warning: "bg-yellow-500",
    good: "bg-green-500"
  };

  if (compact) {
    return (
      <div className={`p-5 rounded-lg shadow-sm ${currentStatus.bgColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${currentStatus.iconColor}`} />
            <h3 className="font-medium text-lg">Absence Status</h3>
          </div>
          <div className="font-bold text-base">
            {attendanceStats?.total_absent}/{maxAllowedAbsences} days
          </div>
        </div>
        
        <div className={`mt-2 mb-3 text-sm ${currentStatus.textColor} font-medium`}>
          {currentStatus.note}
        </div>
        
        <div className="mt-3 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Excused Absence</span>
              <span>{attendanceStats?.excused_absences}/{attendanceStats?.thresholds.excused_threshold}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
              <div 
                className={cn("h-full rounded-full", progressBarColors[status])} 
                style={{ width: `${excusedPercentage}%` }} 
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Without Excuse</span>
              <span>{attendanceStats?.unexcused_absences}/{attendanceStats?.thresholds?.unexcused_threshold}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-red-600" 
                style={{ width: `${Math.round((attendanceStats?.unexcused_absences / attendanceStats?.thresholds?.unexcused_threshold) * 100) || 0}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <Card className={`h-full ${currentStatus.bgColor}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${currentStatus.iconColor}`} />
              <h3 className="text-lg font-semibold">Absence Status</h3>
            </div>

            <div className="bg-white/70 text-foreground px-3 py-1 rounded-full text-sm font-medium">
              {attendanceStats?.total_absent}/{maxAllowedAbsences}
            </div>
          </div>
          
          <div className={`mb-4 text-sm ${currentStatus.textColor} font-medium`}>
            {currentStatus.note}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Total Absences</span>
                <span className="font-medium">{attendanceStats?.total_absent}/{maxAllowedAbsences}</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-3">
                <div 
                  className={cn("h-full rounded-full", progressBarColors[status])} 
                  style={{ width: `${(attendanceStats?.total_absent / maxAllowedAbsences) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm mb-1 mt-3">
                <span>Absences Without Excuse</span>
                <span className="font-medium">{attendanceStats?.unexcused_absences}/{attendanceStats?.thresholds?.unexcused_threshold}</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-3">
                <div 
                  className="h-full rounded-full bg-red-600" 
                  style={{ width: `${Math.round((attendanceStats?.unexcused_absences / attendanceStats?.thresholds?.unexcused_threshold) * 100) || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsenceWarningCard;
