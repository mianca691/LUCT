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
    <header className="flex justify-between items-center 
        bg-background text-foreground border-b border-border shadow-sm
        px-4 py-3">
      
      <div className="flex items-center gap-3">
        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden text-foreground hover:bg-accent hover:text-accent-foreground transition"
          >
            <Menu className="w-6 h-6" />
          </Button>
        )}

        <div className="text-xl font-semibold flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="logo"
            className="w-10 h-10 rounded shadow-sm border border-border"
          />
          <span className="hidden sm:inline tracking-wide">LUCT Portal</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="font-medium text-muted-foreground hidden sm:block">
            {user.name}
          </span>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
