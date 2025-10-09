import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Small delay to ensure localStorage / context rehydrates
  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Role mismatch
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  // All good — render nested routes
  return <Outlet />;
}
