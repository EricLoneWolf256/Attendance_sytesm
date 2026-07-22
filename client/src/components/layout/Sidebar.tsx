import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  BarChart3,
  Settings,
  ClipboardCheck,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_BADGE_COLORS_DARK } from "@/lib/constants";
import type { UserRole } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const superAdminLinks: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/faculties", label: "Faculties", icon: Building2 },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const adminLinks: NavItem[] = [
  { to: "/faculty-admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/faculty-admin/reports", label: "Reports", icon: BarChart3 },
];

const lecturerLinks: NavItem[] = [
  { to: "/lecturer", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/lecturer/sessions", label: "My Sessions", icon: ClipboardCheck },
];

const studentLinks: NavItem[] = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/checkin", label: "Check In", icon: ClipboardCheck },
  { to: "/student/history", label: "My Attendance", icon: BarChart3 },
];

function getLinksForRole(role: UserRole): NavItem[] {
  switch (role) {
    case "SUPER_ADMIN":
      return superAdminLinks;
    case "ADMIN":
      return adminLinks;
    case "LECTURER":
      return lecturerLinks;
    case "STUDENT":
      return studentLinks;
    default:
      return [];
  }
}

interface SidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user ? getLinksForRole(user.role) : [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-4",
          collapsed ? "justify-center" : "gap-3 px-6"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          <img src="/UMU-logo.png" alt="UMU" className="h-full w-full object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-white">UMU</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-umu-gold">
              Attendance
            </span>
          </div>
        )}
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-umu-red text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )
            }
            title={collapsed ? link.label : undefined}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={cn("border-t border-white/10 p-4", collapsed && "px-2")}>
        {!collapsed && user && (
          <div className="mb-3 rounded-lg bg-gray-800 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white",
                ROLE_BADGE_COLORS_DARK[user.role] || "bg-gray-500"
              )}
            >
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden flex-shrink-0 bg-gray-900 text-white transition-all duration-200 lg:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <div className={cn("lg:hidden", mobileOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onMobileClose} />
        <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-200">
          <div className="absolute right-2 top-3.5">
            <button
              onClick={onMobileClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
