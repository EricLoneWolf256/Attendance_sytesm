"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export default function StudentAttendancePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => { if (!isLoading && (!user || user.role !== "STUDENT")) router.push("/login"); }, [user, isLoading, router]);
  useEffect(() => { if (user) api.get(`/attendance/student/${user.id}`).then((res) => setRecords(res.data.data)); }, [user]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">My Attendance</h1><p className="text-sm text-slate-500 mt-1">Your complete attendance history</p></div>
        <Card>
          <CardContent className="p-0">
            {records.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4"><ClipboardList className="h-8 w-8 text-slate-300" /></div>
                <p className="text-sm text-slate-500">No attendance records yet.</p>
                <p className="text-xs text-slate-400 mt-1">Check in by scanning a QR code from your lecturer.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {records.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{record.course?.name}</p>
                      <p className="text-sm text-slate-500">{record.course?.code} | {formatDateTime(record.checkedInAt)}</p>
                    </div>
                    <Badge variant={record.status === "PRESENT" ? "success" : record.status === "LATE" ? "warning" : "destructive"}>{record.status}</Badge>
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
