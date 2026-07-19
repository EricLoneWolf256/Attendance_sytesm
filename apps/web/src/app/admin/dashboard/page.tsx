"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  UserCog,
  Calendar,
  ClipboardList,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) api.get("/reports/dashboard").then((res) => setStats(res.data.data));
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Lecturers", value: stats?.totalLecturers || 0, icon: UserCog, color: "bg-violet-50 text-violet-600" },
    { label: "Total Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { label: "Faculties", value: stats?.totalFaculties || 0, icon: Building2, color: "bg-amber-50 text-amber-600" },
  ];

  const managementLinks = [
    { title: "Faculties", description: "Manage university faculties and their departments", href: "/admin/faculties", icon: Building2 },
    { title: "Departments", description: "Manage departments within each faculty", href: "/admin/departments", icon: Building2 },
    { title: "Programs", description: "Manage academic programs and courses", href: "/admin/programs", icon: GraduationCap },
    { title: "Courses", description: "Create and manage course offerings", href: "/admin/courses", icon: BookOpen },
    { title: "Semesters", description: "Manage academic semesters and terms", href: "/admin/semesters", icon: Calendar },
    { title: "Students", description: "View and manage student accounts", href: "/admin/students", icon: Users },
    { title: "Lecturers", description: "View and manage lecturer accounts", href: "/admin/lecturers", icon: UserCog },
    { title: "Enrollments", description: "Enroll students in courses", href: "/admin/enrollments", icon: ClipboardList },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {user.firstName}. Here&apos;s an overview of the system.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Grid */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {managementLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-slate-300 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <link.icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900">{link.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {stats?.recentAttendance?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest attendance check-ins across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentAttendance.slice(0, 5).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                        {record.student?.user?.firstName?.[0]}{record.student?.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {record.student?.user?.firstName} {record.student?.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{record.course?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={record.status === "PRESENT" ? "success" : "warning"}>
                        {record.status}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(record.checkedInAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
