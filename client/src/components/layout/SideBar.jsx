import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";

const menuItems = {
  student: [
    { label: "Monitor", path: "/student/monitor" },
    { label: "Rating", path: "/student/rating" },
  ],
  lecturer: [
    { label: "Classes", path: "/lecturer/classes" },
    { label: "Reports", path: "/lecturer/reports" },
    { label: "Submit Report", path: "/lecturer/submit-report" },
  ],
  prl: [
    { label: "Reports", path: "/prl/reports" },
    { label: "Feedback", path: "/prl/feedback" },
  ],
  pl: [
    { label: "Courses", path: "/pl/courses" },
    { label: "Assign Lectures", path: "/pl/assign-lectures" },
    { label: "Reports", path: "/pl/reports" },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <nav className="flex flex-col gap-4">
        {menuItems[user.role]?.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `p-2 rounded hover:bg-gray-700 ${
                isActive ? "bg-gray-700 font-semibold" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
