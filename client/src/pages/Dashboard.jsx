import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-semibold mb-4">
        Welcome, {user?.name || "User"} 👋
      </h1>
      <p className="text-gray-600 mb-6">Role: {user?.role || "N/A"}</p>
      <div className="flex space-x-4">
        {user?.role === "lecturer" && (
          <Button onClick={() => navigate("/lecturer/report")}>
            Submit Report
          </Button>
        )}
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
