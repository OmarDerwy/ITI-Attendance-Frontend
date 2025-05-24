import axiosBackendInstance from "./config";

export const attendance_stats = async (eventID: number) => {
  try {
    const response = await axiosBackendInstance.get(
      `attendance/events/attendance_stats/`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEvents = async () => {
  try {
    const response = await axiosBackendInstance.get("attendance/events/");    
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getGuestsData = async (eventID: number) => {   
  try {
    const response = await axiosBackendInstance.get(
      `attendance/events/${eventID}/guest_details/`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}