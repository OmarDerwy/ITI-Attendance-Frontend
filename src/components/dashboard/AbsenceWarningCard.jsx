import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AbsenceWarningCard = ({ absent, maxAbsenceLimit = 5 }) => {
  // Calculate warning status
  const absencePercentage = Math.round((absent / maxAbsenceLimit) * 100);
  const remainingAbsences = maxAbsenceLimit - absent;
  
  // Define status thresholds
  const isDanger = remainingAbsences <= 0;
  const isWarning = remainingAbsences <= 2 && remainingAbsences > 0;
  const isSafe = !isWarning && !isDanger;
  
  return (
    <Card className={cn(
      "overflow-hidden h-full border-l-4 shadow-lg", // Added shadow-lg for more depth
      isSafe && "border-l-green-500",
      isWarning && "border-l-amber-500",
      isDanger && "border-l-red-500"
    )}>
      <CardContent className="pt-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <CardTitle className="text-xl">Absence Status</CardTitle>
        </div>

        {/* Visual warning indicator */}
        <div className="flex justify-center items-center flex-grow">
          <motion.div 
            className={cn(
              "relative w-48 h-48 flex items-center justify-center rounded-full shadow-inner", // Increased from w-36 h-36 to w-48 h-48
              isSafe && "bg-gradient-to-br from-green-50 to-green-100",
              isWarning && "bg-gradient-to-br from-amber-50 to-amber-100",
              isDanger && "bg-gradient-to-br from-red-50 to-red-100"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon with animation */}
            {isSafe && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
                className="drop-shadow-xl" // Added drop shadow effect
              >
                <Shield className="h-20 w-20 text-green-600" /> {/* Increased icon size from h-16 w-16 to h-20 w-20 */}
              </motion.div>
            )}
            
            {isWarning && (
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ 
                  rotate: { duration: 1.5, repeat: Infinity, repeatDelay: 1 },
                  scale: { duration: 2, repeat: Infinity, repeatDelay: 0 }
                }}
                className="drop-shadow-xl" // Added drop shadow effect
              >
                <AlertTriangle className="h-20 w-20 text-amber-600" /> {/* Increased icon size from h-16 w-16 to h-20 w-20 */}
              </motion.div>
            )}
            
            {isDanger && (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 0.5rem rgba(239, 68, 68, 0.5))", "drop-shadow(0 0 0.75rem rgba(239, 68, 68, 0.7))", "drop-shadow(0 0 0.5rem rgba(239, 68, 68, 0.5))"]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertCircle className="h-20 w-20 text-red-600" /> {/* Increased icon size from h-16 w-16 to h-20 w-20 */}
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Status message */}
        <motion.div 
          className={cn(
            "mt-4 p-4 rounded-lg shadow-md", // Added shadow for depth
            isSafe && "bg-gradient-to-r from-green-50 to-green-100 border border-green-200",
            isWarning && "bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200",
            isDanger && "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
          )}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }} // Subtle hover effect
        >
          {isSafe && (
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

          {isWarning && (
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

          {isDanger && (
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

        {/* Progress bar showing absences used */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className={cn(
              isSafe && "text-green-700 font-semibold",
              isWarning && "text-amber-700 font-semibold",
              isDanger && "text-red-700 font-semibold",
            )}>
              Absences: {absent}/{maxAbsenceLimit}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
            <motion.div 
              className={cn(
                "h-3 rounded-full shadow-lg",
                isSafe && "bg-gradient-to-r from-green-400 to-green-500",
                isWarning && "bg-gradient-to-r from-amber-400 to-amber-500",
                isDanger && "bg-gradient-to-r from-red-400 to-red-500"
              )}
              style={{ width: `${Math.min(absencePercentage, 100)}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(absencePercentage, 100)}%` }}
              transition={{ duration: 1 }}
            ></motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsenceWarningCard;
