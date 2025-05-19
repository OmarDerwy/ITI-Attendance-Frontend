import { useUser } from "@/context/UserContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ requireAuth = true, allowedRoles = null }: { requireAuth?: boolean, allowedRoles?: string[] }) => {
  const { isLoading, userRole } = useUser();
  const location = useLocation();

  // Wait for auth check
  if (isLoading) return null;

  const hasToken =
    typeof window !== "undefined" &&
    (localStorage.getItem("access") || localStorage.getItem("refresh"));

  // If route requires auth and user is not logged in, redirect to login
  if (requireAuth && !hasToken && !userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAuth && userRole === "guest" && location.pathname !== "/unauthorized") {
    // If user is a guest and trying to access a protected route, redirect to login
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  if (requireAuth && allowedRoles && !allowedRoles.includes(userRole)) {
    // If user role is not allowed, redirect to unauthorized page
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  // If route is for guests only (e.g., login) and user is logged in, redirect to main page
  if (!requireAuth && hasToken) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the route's children
  return <Outlet />;
};

export default ProtectedRoute;
