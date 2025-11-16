import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 
                           border-b px-4 
                           bg-card text-card-foreground
                           dark:bg-card dark:text-card-foreground
                           backdrop-blur">
          
          <SidebarTrigger className="-ml-1 text-foreground" />

          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-primary">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-primary">
                  {user?.role?.toUpperCase() ?? "USER"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-4">
            <span className="font-medium text-muted-foreground hidden sm:block">
              {user?.name ?? "Guest"}
            </span>

            <button
              onClick={logout}
              className="rounded-md border border-border px-3 py-1 text-sm
                         hover:bg-secondary hover:text-secondary-foreground
                         transition"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 
                         bg-background text-foreground 
                         dark:bg-background dark:text-foreground
                         overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
