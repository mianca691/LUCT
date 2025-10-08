import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center bg-white shadow p-4">
      <div className="text-xl font-bold">
        <img 
        src="/logo.jpg"
        alt="logo" 
        className="w-20 inline mr-2"
        />
        LUCT Portal
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">{user.name}</span>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
