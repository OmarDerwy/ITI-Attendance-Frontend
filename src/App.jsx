import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import OtpVerification from "./pages/Auth/OtpVerification";
import Schedule from "./pages/Attendance/Schedule";
import LostFound from "./pages/LostFound/LostFound";
import StudentVerification from "./pages/Management/StudentVerification";
import AttendanceInsights from "./pages/Attendance/AttendanceInsights";
import ManageMyItems from "./pages/LostFound/ManageMyItems";
import Announcements from "./pages/Announcement/Announcements";
import TrackManagement from "./pages/Management/TrackManagement";
import ReportLostFound from "./pages/LostFound/ReportLostFound";
import Profile from "./pages/Account/Profile";
import PreviousCourses from "./pages/Attendance/PreviousCourses";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/Auth/ResetPassword";
import ForgetPassword from "./pages/Auth/ForgetPassword";
import Activate from "./pages/Auth/Activate";
import BranchManagement from "./pages/Management/BranchManagement";
import BranchForm from "./pages/Management/BranchForm";
import TrackForm from "./pages/Management/TrackForm";
import AttendanceStatus from "./pages/Attendance/AttendanceStatus";
import LeaveRequestCenter from "@/pages/Attendance/LeaveRequestCenter";
import ItemDetail from "./pages/LostFound/ItemDetail";
import MatchedItemDetail from "./pages/LostFound/MatchedItemDetail";
import { ThemeProvider } from "next-themes";
import LeaveRequestForm from "./pages/Attendance/LeaveRequestForm";
import UserForm from "./pages/Management/UserForm";
import UserManagement from './pages/Management/UserManagement';
import StudentSchedule from './pages/Attendance/StudentSchedule';
import { PermissionsProvider } from "@/context/PermissionsContext"; 


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
     <PermissionsProvider>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner
          theme="system"
          position="bottom-right"
          closeButton
          richColors
          className="toast-theme-override"
          toastOptions={{
            classNames: {
              toast: "toast-with-theme",
              title: "toast-title",
              description: "toast-description",
            },
          }}
        />
        <BrowserRouter>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/" element={<LostFound />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
              <Route path="/activate/:token" element={<Activate />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route
                path="/student-verification"
                element={<StudentVerification />}
              />
              <Route path="/report-lost-found" element={<ReportLostFound />} />
              <Route path="/item-details/:type/:id" element={<ItemDetail />} />
              <Route
                path="/matched-item-details/:id"
                element={<MatchedItemDetail />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/previous-courses" element={<PreviousCourses />} />
              <Route
                path="/attendance-insights"
                element={<AttendanceInsights />}
              />
              <Route path="/my-items" element={<ManageMyItems />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/branches" element={<BranchManagement />} />
              <Route path="/branches/add" element={<BranchForm />} />
              <Route path="/branches/edit/:branchId" element={<BranchForm />} />
              <Route path="/tracks" element={<TrackManagement />} />
              <Route path="/tracks/add" element={<TrackForm />} />
              <Route path="/tracks/edit/:trackId" element={<TrackForm />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/users/add" element={<UserForm />} />
              <Route path="/users/edit/:userId" element={<UserForm />} />
              <Route
                path="/attendance-status/:date"
                element={<AttendanceStatus />}
              />
              <Route path="/attendance-status" element={<AttendanceStatus />} />
              <Route
                path="/leave-request-center"
                element={<LeaveRequestCenter />}
              />
              <Route
                path="/leave-request-form"
                element={<LeaveRequestForm />}
              />
              <Route path="/student-schedule" element={<StudentSchedule />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
    </PermissionsProvider>
  </QueryClientProvider>
);

export default App;
