"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Users, UserCog, BookOpen, Building2 } from "lucide-react";

export default function ReportsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login"); }, [user, isLoading, router]);
  useEffect(() => { if (user) api.get("/reports/dashboard").then((res) => setStats(res.data.data)); }, [user]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  const statCards = [
    { label: "Students", value: stats?.totalStudents || 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Lecturers", value: stats?.totalLecturers || 0, icon: UserCog, color: "bg-violet-50 text-violet-600" },
    { label: "Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { label: "Faculties", value: stats?.totalFaculties || 0, icon: Building2, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Reports</h1><p className="text-sm text-slate-500 mt-1">System-wide attendance overview</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">{stat.label}</p><p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p></div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Attendance</CardTitle><CardDescription>Latest check-in records across the system</CardDescription></CardHeader>
          <CardContent>
            {stats?.recentAttendance?.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No recent attendance records.</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentAttendance?.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">{r.student?.user?.firstName?.[0]}{r.student?.user?.lastName?.[0]}</div>
                      <div><p className="text-sm font-medium text-slate-900">{r.student?.user?.firstName} {r.student?.user?.lastName}</p><p className="text-xs text-slate-500">{r.course?.name}</p></div>
                    </div>
                    <div className="text-right">
                      <Badge variant={r.status === "PRESENT" ? "success" : "warning"}>{r.status}</Badge>
                      <p className="text-xs text-slate-400 mt-1">{new Date(r.checkedInAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
