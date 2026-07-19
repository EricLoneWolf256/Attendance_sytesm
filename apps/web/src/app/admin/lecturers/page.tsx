"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

export default function LecturersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [lecturers, setLecturers] = useState<any[]>([]);

  useEffect(() => { if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login"); }, [user, isLoading, router]);
  useEffect(() => { if (user) api.get("/users/lecturers").then((res) => setLecturers(res.data.data)); }, [user]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Lecturers</h1><p className="text-sm text-slate-500 mt-1">{lecturers.length} total lecturers</p></div>
        <Card><CardContent className="p-0"><div className="divide-y divide-slate-100">
          {lecturers.map((l: any) => (
            <div key={l.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">{l.firstName?.[0]}{l.lastName?.[0]}</div>
                <div><p className="font-medium text-slate-900">{l.firstName} {l.lastName}</p><p className="text-sm text-slate-500">{l.email} | Staff ID: {l.lecturerProfile?.staffId || "N/A"}</p></div>
              </div>
              <Badge variant={l.isActive ? "success" : "destructive"}>{l.isActive ? "Active" : "Inactive"}</Badge>
            </div>
          ))}
          {lecturers.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm text-slate-500">No lecturers found.</p></div>}
        </div></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
