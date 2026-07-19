"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function LecturerAttendancePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { if (!isLoading && (!user || user.role !== "LECTURER")) router.push("/login"); }, [user, isLoading, router]);
  useEffect(() => { if (user) api.get("/courses/my").then((res) => setCourses(res.data.data)); }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      Promise.all([api.get(`/attendance/course/${selectedCourse}`), api.get(`/attendance/stats/${selectedCourse}`)])
        .then(([r, s]) => { setRecords(r.data.data); setStats(s.data.data); });
    }
  }, [selectedCourse]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Attendance Records</h1><p className="text-sm text-slate-500 mt-1">View attendance for your courses</p></div>
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Select Course</h3>
            {courses.map((course: any) => (
              <button key={course.id} onClick={() => setSelectedCourse(course.id)}
                className={`w-full text-left p-3 rounded-lg transition-all text-sm ${selectedCourse === course.id ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 hover:border-slate-300 text-slate-700"}`}>
                <p className="font-medium">{course.name}</p><p className={`text-xs mt-0.5 ${selectedCourse === course.id ? "text-slate-300" : "text-slate-400"}`}>{course.code}</p>
              </button>
            ))}
          </div>
          <div className="lg:col-span-3 space-y-6">
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p><p className="text-xs text-slate-500">Enrolled</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{stats.totalSessions}</p><p className="text-xs text-slate-500">Sessions</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{stats.attendanceRate}%</p><p className="text-xs text-slate-500">Attendance Rate</p></CardContent></Card>
              </div>
            )}
            <Card>
              <CardHeader><CardTitle className="text-lg">Check-in Records</CardTitle></CardHeader>
              <CardContent>
                {!selectedCourse ? <p className="text-center text-slate-500 py-8">Select a course to view records.</p>
                : records.length === 0 ? <p className="text-center text-slate-500 py-8">No records for this course.</p>
                : (
                  <div className="space-y-2">
                    {records.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">{r.student?.user?.firstName?.[0]}{r.student?.user?.lastName?.[0]}</div>
                          <div><p className="text-sm font-medium text-slate-900">{r.student?.user?.firstName} {r.student?.user?.lastName}</p><p className="text-xs text-slate-500">{formatDateTime(r.checkedInAt)}</p></div>
                        </div>
                        <Badge variant={r.status === "PRESENT" ? "success" : "warning"}>{r.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
