import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="flex justify-between items-center bg-white shadow p-4">
      <div className="flex items-center gap-3">
        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </Button>
        )}
        <div className="text-xl font-bold flex items-center gap-2">
          <img src="/logo.jpg" alt="logo" className="w-12 h-12 rounded" />
          <span className="hidden sm:inline">LUCT Portal</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700 hidden sm:block">
            {user.name}
          </span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
