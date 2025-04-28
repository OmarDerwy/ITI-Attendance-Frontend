import { createContext, useContext, useState, useEffect } from "react";
import { axiosBackendInstance } from "../api/config";
import { toast } from 'sonner';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [userItems, setUserItems] = useState([]);
  const [userProfilePic, setUserProfilePic] = useState("/placeholder.svg");
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentTrack, setStudentTrack] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);

  const addUserItem = (item) => {
    setUserItems([...userItems, item]);
  };

  const updateUserItem = (id, updatedItem) => {
    setUserItems(
      userItems.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    );
  };

  const deleteUserItem = (id) => {
    setUserItems(userItems.filter((item) => item.id !== id));
  };
  const fetchAttendanceStats = async () => {
    if (userRole === 'student' && userId) {
      try {
        const response = await axiosBackendInstance.get('attendance/attendance-stats/');
        if (response.data) {
          setAttendanceStats(response.data);
          // Optionally store in localStorage if needed
          localStorage.setItem('attendanceStats', JSON.stringify(response.data));
        }
        return response.data;
      } catch (error) {
        console.error("Failed to fetch attendance statistics:", error);
        toast.error("Could not retrieve attendance statistics");
        return null;
      }
    }
    return null;
  };
  const addAnnouncement = (announcement) => {
    setUserAnnouncements([announcement, ...userAnnouncements]);
  };

  const markAnnouncementAsRead = (id) => {
    if (!readAnnouncements.includes(id)) {
      setReadAnnouncements([...readAnnouncements, id]);
    }
  };

  const isAnnouncementRead = (id) => {
    return readAnnouncements.includes(id);
  };

  const updateUserFullName = (fullName) => {
    setUserFullName(fullName || "");
    if (fullName) {
      localStorage.setItem("userFullName", fullName);
    } else {
      localStorage.removeItem("userFullName");
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user data with the stored token
        const response = await axiosBackendInstance.get(
          "accounts/auth/users/me/"
        );
        const role = response.data.groups[0];
        const email = response.data.email;
        const userId = response.data.id;
        localStorage.setItem("userId", userId);
        setUserId(userId);
        setUserRole(role);
        setUserName(email);

        //Load student track data from localStorage if it exists
        const storedTrackData = localStorage.getItem("studentTrack");
        if (storedTrackData && role === "student") {
          setStudentTrack(JSON.parse(storedTrackData));
        }

        // Load user's full name from localStorage if available
        const storedFullName = localStorage.getItem("userFullName");
        if (storedFullName) {
          setUserFullName(storedFullName);
        }
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        // Clear invalid token
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Logout function to clear auth state
  const logout = async () => {
    if (!localStorage.getItem("refresh")) {
      const response = await axiosBackendInstance.post(
        "accounts/auth/jwt/blacklist/",
        {
          refresh: localStorage.getItem("refresh"),
        }
      );
      if (response.status === 200) {
        toast.success("Logged out successfully!");
      } else {
        toast.error("Failed to log out.");
      }
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("studentTrack");
    setUserRole(null);
    setUserName(null);
    setStudentTrack(null);
    setUserFullName("");
    setUserId(null);
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        userRole,
        setUserRole,
        userName,
        setUserName,
        userFullName,
        setUserFullName: updateUserFullName,
        userItems,
        addUserItem,
        updateUserItem,
        deleteUserItem,
        userProfilePic,
        setUserProfilePic,
        userAnnouncements,
        addAnnouncement,
        markAnnouncementAsRead,
        isAnnouncementRead,
        isLoading,
        logout,
        studentTrack,
        attendanceStats,
        setAttendanceStats,
        fetchAttendanceStats,
        setStudentTrack,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
