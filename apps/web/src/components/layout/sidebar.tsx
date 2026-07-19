"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn, getInitials, getRoleColor } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  LogOut,
  Scan,
  ClipboardList,
  UserPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Faculties", href: "/admin/faculties", icon: Building2 },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Programs", href: "/admin/programs", icon: GraduationCap },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Semesters", href: "/admin/semesters", icon: Calendar },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Lecturers", href: "/admin/lecturers", icon: Users },
  { label: "Enrollments", href: "/admin/enrollments", icon: UserPlus },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

const lecturerNav: NavItem[] = [
  { label: "Dashboard", href: "/lecturer/dashboard", icon: LayoutDashboard },
  { label: "QR Session", href: "/lecturer/scan", icon: QrCode },
  { label: "Attendance", href: "/lecturer/attendance", icon: ClipboardList },
];

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Scan QR", href: "/student/scan", icon: Scan },
  { label: "My Attendance", href: "/student/attendance", icon: ClipboardList },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = user.role === "ADMIN" ? adminNav : user.role === "LECTURER" ? lecturerNav : studentNav;
  const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
          UGM
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">Attendance</p>
            <p className="text-xs text-slate-500">Uganda Martyrs University</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-3">
        <div className={cn("flex items-center gap-3 rounded-lg p-2", collapsed && "justify-center")}>
          <Avatar
            fallback={getInitials(user.firstName, user.lastName)}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <Badge variant="secondary" className="mt-0.5 text-[10px]">
                {roleLabel}
              </Badge>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md border border-slate-200 lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col bg-white border-r border-slate-200 transition-all",
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        )}
      >
        <NavContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>
    </>
  );
}
