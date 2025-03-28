
import { createContext, useContext, useState } from "react";

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState("student");
  const [userName, setUserName] = useState("John Doe");
  const [userItems, setUserItems] = useState([]);
  const [userProfilePic, setUserProfilePic] = useState("/placeholder.svg");
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]);

  const addUserItem = (item) => {
    setUserItems([...userItems, item]);
  };

  const updateUserItem = (id, updatedItem) => {
    setUserItems(userItems.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const deleteUserItem = (id) => {
    setUserItems(userItems.filter(item => item.id !== id));
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

  return (
    <UserContext.Provider 
      value={{ 
        userRole, 
        setUserRole, 
        userName, 
        setUserName,
        userItems,
        addUserItem,
        updateUserItem,
        deleteUserItem,
        userProfilePic,
        setUserProfilePic,
        userAnnouncements,
        addAnnouncement,
        markAnnouncementAsRead,
        isAnnouncementRead
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
