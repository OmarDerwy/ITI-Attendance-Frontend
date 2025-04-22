import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, Shield, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

const AbsenceWarningCard = () => {
  const { attendanceStats } = useUser();
  
  // Extract values from attendance stats
  const unexcused_absences = attendanceStats?.unexcused_absences;
  const excused_absences = attendanceStats?.excused_absences;
  const total_absent = attendanceStats?.total_absent;
  
  // Get attendance status directly from the API (lowercase for consistent comparison)
  const attendance_status = attendanceStats?.attendance_status.toLowerCase();
  
  // Get threshold information
  const unexcused_threshold = attendanceStats?.thresholds?.unexcused_threshold;
  const excused_threshold = attendanceStats?.thresholds?.excused_threshold;
  const unexcused_consumed = attendanceStats?.thresholds?.unexcused_consumed;
  const excused_consumed = attendanceStats?.thresholds?.excused_consumed;
  
  // Get remaining absences directly from API
  const remainingAbsences = attendanceStats?.remaining_absences;
  
  // Calculate percentage for progress bars
  const unexcusedPercentage = Math.round((unexcused_absences / unexcused_threshold) * 100);
  const excusedPercentage = Math.round((excused_absences / excused_threshold) * 100);
  
  return (
    <Card className={cn(
      "overflow-hidden h-full border-l-4 shadow-lg",
      attendance_status === 'good' && "border-l-green-500",
      attendance_status === 'warning' && "border-l-amber-500",
      attendance_status === 'danger' && "border-l-red-500"
    )}>
      <CardContent className="pt-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <CardTitle className="text-2xl">Absence Status</CardTitle>
        </div>

        {/* Visual warning indicator */}
        <div className="flex justify-center items-center flex-grow">
          <motion.div 
            className={cn(
              "relative w-48 h-48 flex items-center justify-center rounded-full shadow-inner",
              attendance_status === 'good' && "bg-gradient-to-br from-green-50 to-green-100",
              attendance_status === 'warning' && "bg-gradient-to-br from-amber-50 to-amber-100",
              attendance_status === 'danger' && "bg-gradient-to-br from-red-50 to-red-100"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon with animation */}
            {attendance_status === 'good' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="drop-shadow-xl"
              >
                <Shield className="h-20 w-20 text-green-600" />
              </motion.div>
            )}
            
            {attendance_status === 'warning' && (
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ rotate: { duration: 1.5, repeat: Infinity, repeatDelay: 1 }, scale: { duration: 2, repeat: Infinity, repeatDelay: 0 } }}
                className="drop-shadow-xl"
              >
                <AlertTriangle className="h-20 w-20 text-amber-600" />
              </motion.div>
            )}
            
            {attendance_status === 'danger' && (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 0.5rem rgba(239, 68, 68, 0.5))", "drop-shadow(0 0 0.75rem rgba(239, 68, 68, 0.7))", "drop-shadow(0 0 0.5rem rgba(239, 68, 68, 0.5))"]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertCircle className="h-20 w-20 text-red-600" />
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Status message */}
        <motion.div 
          className={cn(
            "mt-4 p-4 rounded-lg shadow-md",
            attendance_status === 'good' && "bg-gradient-to-r from-green-50 to-green-100 border border-green-200",
            attendance_status === 'warning' && "bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200",
            attendance_status === 'danger' && "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
          )}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          {attendance_status === 'good' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                  className="flex-shrink-0"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 drop-shadow-sm" />
                </motion.div>
                <p className="font-semibold text-green-800">Good Standing</p>
              </div>
              <p className="text-sm text-green-700 pl-7">
                Keep up your excellent attendance record!
              </p>
            </div>
          )}

          {attendance_status === 'warning' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0, -10, 0] }}
                  transition={{ 
                    scale: { duration: 2, repeat: Infinity },
                    rotate: { duration: 2, repeat: Infinity }
                  }}
                  className="flex-shrink-0"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-600 drop-shadow-sm" />
                </motion.div>
                <p className="font-semibold text-amber-800">Approaching Limit</p>
              </div>
              <p className="text-sm text-amber-700 pl-7">
                You have {remainingAbsences} {remainingAbsences === 1 ? 'day' : 'days'} of absence remaining.
              </p>
            </div>
          )}

          {attendance_status === 'danger' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    filter: ["drop-shadow(0 0 0.1rem rgba(220, 38, 38, 0.5))", "drop-shadow(0 0 0.2rem rgba(220, 38, 38, 0.7))", "drop-shadow(0 0 0.1rem rgba(220, 38, 38, 0.5))"]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </motion.div>
                <p className="font-semibold text-red-800">Absence Limit Exceeded</p>
              </div>
              <p className="text-sm text-red-700 pl-7">
                Please contact your supervisor immediately.
              </p>
            </div>
          )}
        </motion.div>

        {/* Progress bars showing absences */}
        <div className="mt-4 space-y-3">
          {/* Unexcused absences progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={cn(
                attendance_status === 'good' && "text-green-700 font-semibold",
                attendance_status === 'warning' && "text-amber-700 font-semibold",
                attendance_status === 'danger' && "text-red-700 font-semibold",
              )}>
                Unexcused Absences: {unexcused_consumed}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
              <motion.div 
                className={cn(
                  "h-3 rounded-full shadow-lg",
                  attendance_status === 'good' && "bg-gradient-to-r from-green-400 to-green-500",
                  attendance_status === 'warning' && "bg-gradient-to-r from-amber-400 to-amber-500",
                  attendance_status === 'danger' && "bg-gradient-to-r from-red-400 to-red-500"
                )}
                style={{ width: `${Math.min(unexcusedPercentage, 100)}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(unexcusedPercentage, 100)}%` }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
          </div>
          
          {/* Excused absences progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-700 font-semibold">
                Excused Absences: {excused_consumed}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
              <motion.div 
                className="h-3 rounded-full shadow-lg bg-gradient-to-r from-blue-400 to-blue-500"
                style={{ width: `${Math.min(excusedPercentage, 100)}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(excusedPercentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsenceWarningCard;
