
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Search,
  User,
  ChevronDown,
  X,
  Menu as MenuIcon,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";

type NavbarProps = {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { userRole, userName, setUserRole } = useUser();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Check-in reminder for today's class", time: "10 min ago" },
    { id: 2, text: "New schedule for next week is available", time: "2 hours ago" },
    { id: 3, text: "Your lost item has been matched!", time: "1 day ago" },
  ];

  // For demonstration purposes, allows changing roles in the UI
  const handleRoleChange = (role: "student" | "supervisor" | "admin") => {
    setUserRole(role);
    setProfileOpen(false);
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
        <div className="flex items-center gap-2 lg:gap-4">
   
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="hidden md:flex py-1.5 capitalize">
            {userRole}
          </Badge>

          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
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
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border-b p-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <p className="text-sm">{notification.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center">
                <a href="#" className="text-xs text-primary hover:underline">
                  View all notifications
                </a>
              </div>
            </div>
          )}

          <Link to="/schedule" className="rounded-full p-1.5 hover:bg-muted transition-colors">
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
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                </div>
                <div className="p-1">
                  {/* Development-only role switcher */}
                  <div className="border-b p-2">
                    <p className="text-xs text-muted-foreground mb-2">Dev: Switch Role</p>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleRoleChange("student")}
                        className={cn(
                          "text-xs text-left px-2 py-1 rounded",
                          userRole === "student" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        Student
                      </button>
                      <button 
                        onClick={() => handleRoleChange("supervisor")}
                        className={cn(
                          "text-xs text-left px-2 py-1 rounded",
                          userRole === "supervisor" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        Supervisor
                      </button>
                      <button 
                        onClick={() => handleRoleChange("admin")}
                        className={cn(
                          "text-xs text-left px-2 py-1 rounded",
                          userRole === "admin" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

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
