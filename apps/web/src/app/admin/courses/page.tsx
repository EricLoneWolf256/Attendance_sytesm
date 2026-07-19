"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function CoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [programId, setProgramId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login"); }, [user, isLoading, router]);
  const fetchData = async () => { const [c, p, s] = await Promise.all([api.get("/courses"), api.get("/programs"), api.get("/semesters")]); setCourses(c.data.data); setPrograms(p.data.data); setSemesters(s.data.data); };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/courses/${editingId}`, { name, code, programId, semesterId }); }
      else { await api.post("/courses", { name, code, programId, semesterId }); }
      setName(""); setCode(""); setProgramId(""); setSemesterId(""); setEditingId(null); setShowForm(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Courses</h1><p className="text-sm text-slate-500 mt-1">Manage course offerings</p></div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setName(""); setCode(""); setProgramId(""); setSemesterId(""); }} className="bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4 mr-1.5" /> Add Course</Button>
        </div>
        {showForm && (
          <Card><CardHeader><CardTitle className="text-lg">{editingId ? "Edit" : "New"} Course</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Program</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={programId} onChange={(e) => setProgramId(e.target.value)} required>
                    <option value="">Select</option>{programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Semester</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={semesterId} onChange={(e) => setSemesterId(e.target.value)} required>
                    <option value="">Select</option>{semesters.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex gap-2"><Button type="submit" className="bg-slate-900 hover:bg-slate-800">{editingId ? "Update" : "Create"}</Button><Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        )}
        <Card><CardContent className="p-0"><div className="divide-y divide-slate-100">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">{c.code}</div>
                <div><p className="font-medium text-slate-900">{c.name}</p><p className="text-sm text-slate-500">Program: {c.program?.name} | {c.enrollments?.length || 0} enrolled</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(c.id); setName(c.name); setCode(c.code); setProgramId(c.programId); setSemesterId(c.semesterId); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={async () => { if (confirm("Delete?")) { await api.delete(`/courses/${c.id}`); fetchData(); } }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm text-slate-500">No courses yet.</p></div>}
        </div></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
