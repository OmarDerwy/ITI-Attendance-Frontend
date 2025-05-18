import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import Schedule from "./pages/Attendance/Schedule";
import LostFound from "./pages/LostFound/LostFound";
import StudentVerification from "./pages/Management/StudentVerification";
import ManageMyItems from "./pages/LostFound/ManageMyItems";
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
import LeaveRequestForm from "./pages/Attendance/LeaveRequestForm";
import UserForm from "./pages/Management/UserForm";
import UserManagement from './pages/Management/UserManagement';
import StudentSchedule from './pages/Attendance/StudentSchedule';
import StudentsWithWarnings from "@/pages/Attendance/StudentsWithWarnings";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import CoordinatorForm from './pages/Management/CoordinatorForm';
import CoordinatorManagement from './pages/Management/CoordinatorManagement';
import TracksView from "./pages/Management/TracksView";
import EventsReport from "./pages/Reports/EventsReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Routes>
            {/* Guest-only routes */}
            <Route element={<ProtectedRoute requireAuth={false} />}>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
              <Route path="/activate/:token" element={<Activate />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
            </Route>
            {/* Authenticated-only routes */}
            <Route element={<ProtectedRoute requireAuth={true} />}>
              <Route path="/" element={<Index />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/report-lost-found" element={<ReportLostFound />} />
              <Route path="/item-details/:type/:id" element={<ItemDetail />} />
              <Route path="/matched-item-details/:id" element={<MatchedItemDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-items" element={<ManageMyItems />} />

            </Route>
            {/* Student-only routes */}
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={["student"]} />}>
              <Route path="/student-schedule" element={<StudentSchedule />} />
              <Route path="/leave-request-form" element={<LeaveRequestForm />} />
              <Route path="/previous-courses" element={<PreviousCourses />} />

            </Route>
            {/* Coordinator and Supervisor routes */}
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={["coordinator", "supervisor"]} />}>
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/student-verification" element={<StudentVerification />} />
              <Route path="/attendance-status/:date" element={<AttendanceStatus />} />
              <Route path="/attendance-status" element={<AttendanceStatus />} />
              {/* <Route path="/events-schedule" element={<Schedule />} /> when events are implemented */}
              <Route path="/students-with-warnings" element={<StudentsWithWarnings />} />
              <Route path="/leave-request-center" element={<LeaveRequestCenter />} />

            </Route>
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={["coordinator"]} />}>
              <Route path="/events-report" element={<EventsReport />} />
              <Route path="/tracks/edit/:trackId" element={<TrackForm />} />
              <Route path="/tracks/add" element={<TrackForm />} />
              <Route path="/tracks" element={<TrackManagement />} />

            </Route>
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={["branch-manager"]} />}>
              <Route path="/coordinators/edit/:coordinatorId" element={<CoordinatorForm />} />
              <Route path="/coordinators/add" element={<CoordinatorForm />} />
              <Route path="/coordinators" element={<CoordinatorManagement />} />
            </Route>
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={["admin"]} />}>
              <Route path="/users/edit/:userId" element={<UserForm />} />
              <Route path="/users/add" element={<UserForm />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/branches/edit/:branchId" element={<BranchForm />} />
              <Route path="/branches/add" element={<BranchForm />} />
              <Route path="/branches" element={<BranchManagement />} />
            </Route>
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={["admin", "branch-manager"]} />}>
              <Route path="/tracks/view" element={<TracksView />} />
              
            </Route>
            {/* Not found route */}
            {/* <Route path="/unautherized" element={<NotFound />} /> pending creatiion */}
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </UserProvider>
  </QueryClientProvider>
);

export default App;
