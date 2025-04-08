import { axiosBackendInstance } from './config';

export const getAllPermissions = async () => {
  try {
    const response = await axiosBackendInstance.get('attendance/permission-requests/');
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
}