import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react"; // shadcn uses lucide-react icons

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center bg-white shadow p-4">
      {/* Left section with toggle and logo */}
      <div className="flex items-center gap-3">
        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden" // only show on mobile
          >
            <Menu className="w-6 h-6" />
          </Button>
        )}
        <div className="text-xl font-bold flex items-center gap-2">
          <img src="/logo.jpg" alt="logo" className="w-12 h-12 rounded" />
          <span className="hidden sm:inline">LUCT Portal</span>
        </div>
      </div>

      {/* Right section: user info and logout */}
      {user && (
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700 hidden sm:block">
            {user.name}
          </span>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
