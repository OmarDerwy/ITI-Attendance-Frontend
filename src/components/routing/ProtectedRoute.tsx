import { useUser } from "@/context/UserContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ requireAuth = true }: { requireAuth?: boolean }) => {
  const { isLoading, userRole } = useUser();
  const location = useLocation();

  // Wait for auth check
  if (isLoading) return null;

  const hasToken =
    typeof window !== "undefined" &&
    (localStorage.getItem("access") || localStorage.getItem("refresh"));

  // If route requires auth and user is not logged in, redirect to login
  if (requireAuth && !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is for guests only (e.g., login) and user is logged in, redirect to main page
  if (!requireAuth && hasToken) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the route's children
  return <Outlet />;
};

export default ProtectedRoute;
