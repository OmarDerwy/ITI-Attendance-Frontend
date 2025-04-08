import axiosBackendInstance from './config';

export const getSupervisorAttendanceData = async (date?: string, trackId?: number) => {
  try {
    const params: any = {};
    if (date) params.date = date;
    if (trackId) params.track_id = trackId;

    const response = await axiosBackendInstance.get('attendance/supervisor-attendance/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching supervisor attendance data:', error);
    throw error;
  }
};

// Fetch today's attendance percentage
export const getTodaysAttendancePercentage = async (): Promise<{
  date: string;
  total_students: number;
  attended_students: number;
  attendance_percentage: number;
}> => {
  try {
    const response = await axiosBackendInstance.get('attendance/attendance-percentage/today');
    
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s attendance percentage:', error);
    throw error;
  }
};

// Fetch weekly attendance percentage
export const getWeeklyAttendancePercentage = async (): Promise<{
  start_date: string;
  end_date: string;
  total_students: number;
  attended_students: number;
  attendance_percentage: number;
}> => {
  try {
    const response = await axiosBackendInstance.get('attendance/attendance-percentage/weekly');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching weekly attendance percentage:', error);
    throw error;
  }
};

// Fetch attendance trends (daily, weekly, monthly) with optional track filter
export const getAttendanceTrends = async (trackId?: number): Promise<{
  daily_trends: { date: string; attended: number }[];
  weekly_trends: { week: string; attended: number }[];
  monthly_trends: { month: string; attended: number }[];
}> => {
  try {
    const params: any = {};
    if (trackId) params.track_id = trackId;

    const response = await axiosBackendInstance.get('attendance/attendance-trends', { params });
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance trends:', error);
    throw error;
  }
};
