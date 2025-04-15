import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  User,
  ChevronDown,
  X,
  Menu as MenuIcon,
  Search,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";
import useWebSocket from "react-use-websocket";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/api/notifications";
import { setupAxiosInterceptors } from "@/api/config";
import { toast } from "sonner"; // Import from sonner directly

type NavbarProps = {
  toggleSidebar: () => void;
};

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { userRole, userName, setUserRole } = useUser();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: number; message: string; created_at: string; is_read: boolean; matched_item: number }[]
  >([]);

  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(() => navigate("/login"));
  }, [navigate]);

  if (import.meta.env.VITE_ENABLE_NOTIFICATIONS === "true") {
    const SOCKET_URL = `ws://localhost:8000/ws/notifications/?token=${token}`;
    const { lastMessage } = useWebSocket(SOCKET_URL, {
      onOpen: () => console.log("WebSocket Connected"),
      onClose: () => console.log("WebSocket Disconnected"),
      // onError: (error) => console.error("WebSocket Error:", error),
      shouldReconnect: () => true,
    });

    // Improved sort function that handles different date formats
    const sortNotificationsByDate = (notifs: typeof notifications) => {
      return [...notifs].sort((a, b) => {
        // Convert dates to timestamps for reliable comparison
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        // If dates are invalid, move them to the end
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;

        return dateB - dateA; // Sort newest first
      });
    };

    // Fetch notifications from the API
    const fetchNotifications = async () => {
      try {
        const data = await getUserNotifications();
        // Always sort immediately after fetching
        const sortedData = sortNotificationsByDate(data);
        setNotifications(sortedData);
        // console.log("Fetched and sorted notifications:", sortedData);
      } catch (error) {
        // console.error("Failed to fetch notifications:", error);
      }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Handle WebSocket messages
    useEffect(() => {
      if (lastMessage !== null) {
        try {
          const data = JSON.parse(lastMessage.data);
          // console.log("WebSocket message received:", data.body);

          const newNotification = {
            id: Date.now(),
            message: data.body || "New notification",
            created_at: new Date().toISOString(), // Use ISO format for consistent sorting
            is_read: false,
            matched_item: data.matched_item,
          };

          // Add the new notification and ensure the entire list is sorted
          setNotifications((prev) => {
            const updatedNotifications = [newNotification, ...prev];
            return sortNotificationsByDate(updatedNotifications);
          });

          // Show toast notification using Sonner
          toast("New Notification", {
            description: newNotification.message,
            position: "bottom-right",
            duration: 5000,
          });
        } catch (err) {
          console.error("Invalid message received:", lastMessage.data);
        }
      }
    }, [lastMessage]);
  }

  // Calculate the number of unread notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleRoleChange = (role: "student" | "supervisor" | "admin") => {
    setUserRole(role);
    setProfileOpen(false);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
      notifications.filter((notification) =>  {
        if (notification.id === id && notification.matched_item) {
          navigate(`/matched-item-details/${notification.matched_item}`);
        }
        return notification;
      })
    } catch (error) {
      // console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <button
        onClick={toggleSidebar}
        className="lg:hidden mr-2 rounded-md p-1.5 hover:bg-muted"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-4"></div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="hidden md:flex py-1.5 capitalize">
            {userRole}
          </Badge>

          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-4 sm:right-16 top-16 w-[calc(100%-2rem)] sm:w-80 overflow-hidden rounded-md border bg-card shadow-lg animate-in slide-down">
              <div className="flex items-center justify-between border-b p-3">
                <h3 className="font-medium">Notifications</h3>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b p-3 cursor-pointer ${
                        notification.is_read
                          ? "bg-white hover:bg-muted/50" // read notifications
                          : "bg-gray-100 hover:bg-gray-200 font-bold" // unread notifications
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString(
                          "en-GB",
                          {
                            timeZone: "Africa/Cairo", // Cairo, Egypt timezone
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true, // Use 12-hour format with AM/PM
                          }
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <Link
            to="/schedule"
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <Calendar className="h-5 w-5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-full hover:bg-muted transition-colors p-1.5"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted">
                <User className="h-8 w-8 p-1.5" />
              </div>
              <span className="hidden text-sm font-medium md:block">
                {userName}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-md border bg-card shadow-lg animate-in fade-in slide-down">
                <div className="border-b p-3">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userRole}
                  </p>
                </div>
                <div className="p-1">
                  {/* Development-only role switcher */}
                  {/* <div className="border-b p-2">
                    <p className="text-xs text-muted-foreground mb-2">Dev: Switch Role</p>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleRoleChange("student")}
                        className={cn(
                          "text-xs text-left px-2 py-1 rounded",
                          userRole === "student"
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        Student
                      </button>
                      <button
                        onClick={() => handleRoleChange("supervisor")}
                        className={cn(
                          "text-xs text-left px-2 py-1 rounded",
                          userRole === "supervisor"
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        Supervisor
                      </button>
                      <button
                        onClick={() => handleRoleChange("admin")}
                        className={cn(
                          "text-xs text-left px-2 py-1 rounded",
                          userRole === "admin"
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        Admin
                      </button>
                    </div>
                  </div> */}

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/schedule"
                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </Link>
                  <Link
                    to="/lost-found"
                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Search className="h-4 w-4" />
                    Lost Items
                  </Link>
                </div>
                <div className="border-t p-1">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
