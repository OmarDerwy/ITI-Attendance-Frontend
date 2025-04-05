import axiosBackendInstance from './config';

export const getUserNotifications = async () => {
  try {
    const response = await axiosBackendInstance.get('lost-and-found/notifications');
    console.log('Notifications response:', response.data.results);
    return Array.isArray(response.data.results) ? response.data.results : [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: number) => {
  try {
    const response = await axiosBackendInstance.post(
      `lost-and-found/notifications/${notificationId}/mark-as-read/`
    );
    console.log('Mark as read response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosBackendInstance.post(
      'lost-and-found/notifications/mark-all-as-read/'
    );
    console.log('Mark all as read response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};