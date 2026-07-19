"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ClipboardList, BarChart3, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function LecturerDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "LECTURER")) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) api.get("/courses/my").then((res) => setCourses(res.data.data));
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {user.firstName}. Manage your courses and attendance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/lecturer/scan">
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-slate-300">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white mb-4">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">Start QR Session</h3>
                <p className="text-sm text-slate-500 mt-1">Generate rotating QR codes for attendance</p>
                <ArrowRight className="h-4 w-4 text-slate-300 mt-3 group-hover:text-slate-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/lecturer/attendance">
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-slate-300">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">View Attendance</h3>
                <p className="text-sm text-slate-500 mt-1">Check attendance records for your courses</p>
                <ArrowRight className="h-4 w-4 text-slate-300 mt-3 group-hover:text-slate-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/lecturer/attendance">
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-slate-300">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">Generate Reports</h3>
                <p className="text-sm text-slate-500 mt-1">View course analytics and export data</p>
                <ArrowRight className="h-4 w-4 text-slate-300 mt-3 group-hover:text-slate-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* My Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Courses</CardTitle>
            <CardDescription>Courses you are teaching this semester</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">No courses assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                    <div>
                      <p className="font-medium text-slate-900">{course.name}</p>
                      <p className="text-sm text-slate-500">{course.code}</p>
                    </div>
                    <Link href={`/lecturer/scan?courseId=${course.id}`}>
                      <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                        Start Session <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
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
