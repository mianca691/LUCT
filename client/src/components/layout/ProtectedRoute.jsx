import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ roles }) {
  const { user, loading, justLoggedOut, setJustLoggedOut } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (justLoggedOut && location.pathname === "/") {
      setJustLoggedOut(false);
    }
  }, [justLoggedOut, location, setJustLoggedOut]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    if (justLoggedOut) return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
