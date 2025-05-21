import { useLocation, Link } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const Unauthorized = () => {
  const location = useLocation();
  const { userRole, logout } = useUser();

  // Try to get the attempted path from location.state
  const attemptedPath = location.state?.from?.pathname || "the requested page";

  return (
    <div style={{ maxWidth: 500, margin: "60px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, background: "#fff", textAlign: "center" }}>
      <h1 style={{ color: "#d32f2f" }}>Unauthorized</h1>
      <p style={{ margin: "16px 0" }}>
        {userRole === "guest" ? (
          <>
            Sorry, guest users are not allowed to access this site.<br />
            Please use the ITI Attendance mobile app to access your information.
          </>
        ) : (
          <>
            Sorry, you do not have the privilege to access <b>{attemptedPath}</b>.<br />
            If you believe this is a mistake, please contact your administrator.
          </>
        )}
      </p>
      { userRole === 'guest' ? <Link onClick={logout} style={{ color: "#1976d2", textDecoration: "underline" }}>Logout</Link> :<Link to="/" style={{ color: "#1976d2", textDecoration: "underline" }}>Go to Home</Link>}
    </div>
  );
};

export default Unauthorized;
