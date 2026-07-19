"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

export default function EnrollmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => { if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login"); }, [user, isLoading, router]);
  const fetchData = async () => { const [e, c, s] = await Promise.all([api.get("/enrollments"), api.get("/courses"), api.get("/users/students")]); setEnrollments(e.data.data); setCourses(c.data.data); setStudents(s.data.data); };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post("/enrollments", { studentId, courseId }); setShowForm(false); setStudentId(""); setCourseId(""); fetchData(); }
    catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Enrollments</h1><p className="text-sm text-slate-500 mt-1">{enrollments.length} total enrollments</p></div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4 mr-1.5" /> Enroll Student</Button>
        </div>
        {showForm && (
          <Card><CardHeader><CardTitle className="text-lg">Enroll Student in Course</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleEnroll} className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-2"><label className="text-sm font-medium">Student</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
                    <option value="">Select Student</option>{students.map((s: any) => <option key={s.id} value={s.studentProfile?.id}>{s.firstName} {s.lastName} ({s.studentProfile?.studentNumber})</option>)}
                  </select>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">Course</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
                    <option value="">Select Course</option>{courses.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Enroll</Button>
              </form>
            </CardContent>
          </Card>
        )}
        <Card><CardContent className="p-0"><div className="divide-y divide-slate-100">
          {enrollments.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div><p className="font-medium text-slate-900">{e.student?.user?.firstName} {e.student?.user?.lastName}</p><p className="text-sm text-slate-500">{e.course?.name} ({e.course?.code}) | Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}</p></div>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={async () => { if (confirm("Remove enrollment?")) { await api.delete(`/enrollments/${e.id}`); fetchData(); } }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {enrollments.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm text-slate-500">No enrollments yet.</p></div>}
        </div></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
