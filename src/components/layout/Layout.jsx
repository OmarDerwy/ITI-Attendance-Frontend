
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { userRole } = useUser();

  const isLoginPage = 
    location.pathname === "/login" || 
    location.pathname === "/register" || 
    location.pathname === "/forget-password" ||
    location.pathname === "/otp-verification";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex flex-col flex-1 w-full transition-all duration-300",
        sidebarOpen ? "lg:pl-70" : "lg:pl-16"
      )}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto animate-in fade-in slide-up duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
