import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  CalendarDays, 
  CheckSquare, 
  Home, 
  Search, 
  Settings, 
  Users, 
  MapPin, 
  FileSpreadsheet, 
  LogOut, 
  Menu, 
  ChevronLeft,
  BarChart3,
  Layers,
  ShieldAlert,
  UserCheck,
  Flag,
  Brain,
  Building,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active?: boolean;
  expanded: boolean;
  roles?: Array<"student" | "supervisor" | "admin">;
}

const NavItem = ({ icon: Icon, label, to, active, expanded, roles = [] }: NavItemProps) => {
  const { userRole } = useUser();

  // Only show items relevant to current role
  if (roles.length > 0 && !roles.includes(userRole as "student" | "supervisor" | "admin")) return null;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-x-2.5 h-10 text-sm px-3 rounded-lg transition-all duration-200 ease-in-out",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground/70 hover:bg-accent/50 hover:text-foreground",
        !expanded && "justify-center px-2"
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")} />
      {expanded && <span className="truncate">{label}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { userRole } = useUser();

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setExpanded(false);
      } else if (window.innerWidth >= 1024) {
        // Auto-expand on larger screens
        setExpanded(true);
      }
    };
    
    checkSize();
    window.addEventListener("resize", checkSize);
    
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setExpanded(!expanded);
    }
  };

  const navItems: Array<{
    icon: React.ElementType; 
    label: string; 
    to: string; 
    roles: Array<"student" | "supervisor" | "admin">
  }> = [
    // Student, Supervisor, Admin
    { icon: Home, label: "Dashboard", to: "/", roles: ["student", "supervisor", "admin"] },


    { icon: CheckSquare, label: "Attendance history", to: "/previous-courses", roles: ["student"] },
    { icon: CalendarDays, label: "Schedule", to: "/schedule", roles: ["student", "supervisor"] },

    // Supervisor only
    { icon: Brain, label: "Attendance Insights", to: "/attendance-insights", roles: ["supervisor"] },
    { icon: UserCheck, label: "Student Verification", to: "/student-verification", roles: ["supervisor"] },
    
    // Admin only
    { icon: Megaphone, label: "Announcements", to: "/announcements", roles: ["admin"] },
    { icon: Building, label: "Branches", to: "/branches", roles: ["admin"] },
    { icon: MapPin, label: "Tracks", to: "/tracks", roles: ["admin"] },
    { icon: Users, label: "Supervisors", to: "/supervisors", roles: ["admin"] },


    { icon: Flag, label: "Report Item", to: "/report-lost-found", roles: ["student", "supervisor", "admin"] },
    { icon: Search, label: "Lost & Found", to: "/lost-found", roles: ["student", "supervisor", "admin"] },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Mobile Toggle Button - Fixed at the bottom left */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}
      
      <aside
        className={cn(
          "sticky top-0 flex flex-col border-r shadow-sm transition-all duration-300 ease-in-out bg-card/90 backdrop-blur-md",
          expanded ? "w-64" : "w-16",
          isMobile && expanded && isOpen ? "translate-x-0" : isMobile && expanded && !isOpen ? "-translate-x-full" : "",
          !isMobile && !expanded ? "w-16" : "",
          isMobile && !expanded ? "w-0" : ""
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b bg-card/80">
          {expanded ? (
            <Link to="/" className="flex items-center gap-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground font-bold">
                A
              </div>
              <span className="text-lg font-semibold">Attendance</span>
            </Link>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground font-bold mx-auto">
              A
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className={cn(
              "rounded-md p-1.5 hover:bg-muted transition-colors duration-200",
              !expanded && "mx-auto"
            )}
          >
            {expanded ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={location.pathname === item.to}
                expanded={expanded}
                roles={item.roles}
              />
            ))}
          </nav>
        </div>

        <div className="p-3 border-t">
          <NavItem 
            icon={LogOut} 
            label="Log out" 
            to="/login" 
            expanded={expanded}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
