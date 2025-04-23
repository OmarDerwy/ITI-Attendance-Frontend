import React, { useState, useEffect } from "react";
import { CheckSquare, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useUser } from '@/context/UserContext';

const CircularProgress = ({ value, max, color, bgColor, label, icon }) => {
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
            stroke={bgColor || `${color}15`} 
            strokeWidth="7" 
          />
          {/* Progress circle with animation */}
          <motion.circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke={color} 
            strokeWidth="7" 
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
            className="text-lg font-medium"
            style={{ color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {count}
          </motion.span>
        </div>
      </div>
      <span className="text-sm font-medium mt-2 text-gray-500">{label}</span>
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
    <Card className="h-full shadow-md border border-gray-100 bg-gradient-to-br from-white to-slate-50">
      <CardContent className="pt-6 h-full">
        <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">Attendance Overview</h3>
        
        <div className="flex justify-center gap-8 flex-wrap">
          <CircularProgress 
            value={present} 
            max={totalDays} 
            color="#4ade80" 
            bgColor="#e6f7ec"
            label="Present Days"
            icon={<CheckSquare size={16} style={{ color: "#4ade80" }} />}
          />
          <CircularProgress 
            value={absent} 
            max={totalDays} 
            color="#f87171" 
            bgColor="#fdf2f2"
            label="Absent Days" 
            icon={<Clock size={16} style={{ color: "#f87171" }} />}
          />
        </div>
        
        <div className="mt-6 text-center p-3 bg-slate-50 rounded-lg shadow-inner">
          <p className="text-sm text-gray-600 mb-1">Overall Attendance</p>
          <div className="flex items-center justify-center gap-1">
            <span className="font-semibold text-indigo-600 text-lg">{attendancePercentage}%</span>
            <span className="text-xs text-gray-400">of classes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceStatsCard;
