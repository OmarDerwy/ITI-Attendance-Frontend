import React, { useState, useEffect } from "react";
import { CheckSquare, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useUser } from '@/context/UserContext';

const CircularProgress = ({ value, max, color, label, icon }) => {
  const percentage = (value / max) * 100;
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < value) {
        setCount(prev => Math.min(prev + 1, value));
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [count, value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke={`${color}20`} 
            strokeWidth="6" 
          />
          {/* Progress circle with animation */}
          <motion.circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke={color} 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeDashoffset="0" 
            transform="rotate(-90 50 50)"
            initial={{ strokeDasharray: "0 251" }}
            animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <span className="mb-1">{icon}</span>}
          <motion.span 
            className="text-xl font-bold"
            style={{ color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {count}
          </motion.span>
        </div>
      </div>
      <span className="text-sm font-medium mt-1 text-gray-600">{label}</span>
    </div>
  );
};

const AttendanceStatsCard = () => {
  const { attendanceStats } = useUser();
  
  // Use data from API response structure
  const present = attendanceStats?.total_attended || 0;
  const absent = attendanceStats?.total_absent || 0;
  const totalDays = attendanceStats?.total_days || (present + absent);
  const attendancePercentage = attendanceStats?.attendance_percentage || 
    (totalDays > 0 ? Math.round((present / totalDays) * 100) : 0);

  return (
    <Card className="h-full shadow-sm border border-gray-100">
      <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
        <div className="space-y-6 w-full">
          <CircularProgress 
            value={present} 
            max={totalDays} 
            color="#22c55e" 
            label="Present Days"
            icon={<CheckSquare size={15} style={{ color: "#22c55e" }} />}
          />
          <CircularProgress 
            value={absent} 
            max={totalDays} 
            color="#ef4444" 
            label="Absent Days" 
            icon={<Clock size={15} style={{ color: "#ef4444" }} />}
          />
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Overall Attendance</p>
          <p className="font-semibold text-blue-600 text-sm">
            {attendancePercentage}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceStatsCard;
