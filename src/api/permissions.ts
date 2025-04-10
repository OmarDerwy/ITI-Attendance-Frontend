import { axiosBackendInstance } from './config';

export const getAllPermissions = async () => {
  try {
    const response = await axiosBackendInstance.get('attendance/permission-requests/');
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}