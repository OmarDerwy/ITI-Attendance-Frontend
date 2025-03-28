
import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart as RechartBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const AttendanceBarChart = ({ data, title, description, period, onPeriodChange }) => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100/30 border-purple-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onPeriodChange && (
            <select 
              value={period} 
              onChange={(e) => onPeriodChange(e.target.value)}
              className="h-8 w-36 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <div className="h-[300px] w-full px-2">
          <ChartContainer 
            config={{
              attendance: { color: '#10b981' },
              absence: { color: '#ef4444' }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  dataKey="attendance" 
                  name="Present" 
                  fill="var(--color-attendance)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={36}
                />
                <Bar 
                  dataKey="absence" 
                  name="Absent" 
                  fill="var(--color-absence)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={36}
                />
              </RechartBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceBarChart;
