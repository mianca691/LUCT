import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, BookOpen, Users, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Role-based sidebar links
  const roleLinks = {
    lecturer: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Classes", path: "/lecturer/classes", icon: BookOpen },
      { name: "Reports", path: "/lecturer/reports", icon: FileText },
      { name: "Submit Report", path: "/lecturer/submit-report", icon: FileText },
    ],
    pl: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Courses", path: "/pl/courses", icon: BookOpen },
      { name: "Assign Lectures", path: "/pl/assign-lectures", icon: Users },
      { name: "Reports", path: "/pl/reports", icon: FileText },
    ],
    prl: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Reports", path: "/prl/reports", icon: FileText },
      { name: "Feedback", path: "/prl/feedback", icon: Users },
    ],
    student: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Monitor", path: "/student/monitor", icon: BookOpen },
      { name: "Rating", path: "/student/rating", icon: FileText },
    ],
  };

  const links = roleLinks[user?.role?.toLowerCase?.()] ?? [];

  return (
    <Sidebar>
      <SidebarContent>
        {/* Group: Portal Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold tracking-wide text-gray-700">
            <div className="flex items-center gap-2 m-px">
              <img src="/logo.jpg" alt="LUCT Logo" className="h-8" />
              LUCT Portal
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(({ name, path, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Link to={path}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
