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
import {
  Home,
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Star,
  ChartNoAxesCombined,
  BookmarkPlus,
  GraduationCap,
  FileCheck,
  BookOpenCheck,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const roleLinks = {
    lecturer: [
      { name: "Overview", path: "/lecturer/overview", icon: Home },
      { name: "Classes", path: "/lecturer/classes", icon: GraduationCap },
      { name: "Reports", path: "/lecturer/reports", icon: FileText },
      { name: "Submit Report", path: "/lecturer/submit-report", icon: FileCheck },
    ],
    pl: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Courses", path: "/pl/courses", icon: BookOpenCheck },
      { name: "Classes", path: "/pl/classes", icon: GraduationCap },
      { name: "Lecturers", path: "/pl/lectures", icon: Users },
      { name: "Monitoring", path: "/pl/monitoring", icon: ChartNoAxesCombined },
      { name: "Reports", path: "/pl/reports", icon: FileText },
      { name: "Rating", path: "/pl/rating", icon: Star },
    ],
    prl: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Reports", path: "/prl/reports", icon: FileText },
      { name: "Courses", path: "/prl/courses", icon: BookOpenCheck },
      { name: "Monitoring", path: "/prl/monitoring", icon: ChartNoAxesCombined },
      { name: "Rating", path: "/prl/rating", icon: Star },
      { name: "Classes", path: "/prl/classes", icon: GraduationCap },
    ],
    student: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Monitoring", path: "/student/monitor", icon: ChartNoAxesCombined },
      { name: "Rating", path: "/student/rating", icon: Star },
      { name: "Enrollments", path: "/student/enrollments", icon: BookmarkPlus },
      { name: "Attendance", path: "/student/attendance", icon: CheckSquare },
    ],
  };

  const links = roleLinks[user?.role?.toLowerCase?.()] ?? [];

  return (
    <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>

          <SidebarGroupLabel className="text-base font-semibold tracking-wide px-3 py-6 mb-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="LUCT Logo" className="h-8 rounded-sm" />
              <span>LUCT Portal</span>
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
                      className={`
                        flex items-center gap-3 px-4 py-6 rounded-md transition-all
                        ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-inner border-l-4 border-sidebar-primary"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }
                      `}
                    >
                      <Link to={path}>
                        <Icon className="w-8 h-8 shrink-0" />
                        <span className="truncate text-base font-medium">{name}</span>
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
