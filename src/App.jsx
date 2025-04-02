
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Index from './pages/Index';
import Login from './pages/Auth/Login';
import OtpVerification from './pages/Auth/OtpVerification';
import Schedule from './pages/Attendance/Schedule';
import LostFound from './pages/LostFound/LostFound';
import StudentVerification from './pages/Management/StudentVerification';
import AttendanceInsights from './pages/Attendance/AttendanceInsights';
import ManageMyItems from './pages/LostFound/ManageMyItems';
import SupervisorManagement from './pages/Management/SupervisorManagement';
import Announcements from './pages/Announcement/Announcements';
import TrackManagement from './pages/Management/TrackManagement';
import ReportLostFound from './pages/LostFound/ReportLostFound';
import Profile from './pages/Account/Profile';
import PreviousCourses from "./pages/Attendance/PreviousCourses";
import NotFound from './pages/NotFound';
import Register from "./pages/Auth/Register";
import ForgetPassword from "./pages/Auth/ForgetPassword";
import Activate from "./pages/Auth/Activate";
import BranchManagement from "./pages/Management/BranchManagement";
import BranchForm from "./pages/Management/BranchForm";
import TrackForm from './pages/Management/TrackForm';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate/:token" element={<Activate />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/student-verification" element={<StudentVerification />} />
            <Route path="/report-lost-found" element={<ReportLostFound />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/previous-courses" element={<PreviousCourses />} />
            <Route path="/attendance-insights" element={<AttendanceInsights />} />
            <Route path="/my-items" element={<ManageMyItems />} />
            <Route path="/supervisors" element={<SupervisorManagement />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/branches" element={<BranchManagement />} />
            <Route path="/branches/add" element={<BranchForm />} />
            <Route path="/branches/edit/:branchId" element={<BranchForm />} />
            <Route path="/tracks" element={<TrackManagement />} />
            <Route path="/tracks/add" element={<TrackForm />} />
            <Route path="/tracks/edit/:trackId" element={<TrackForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
