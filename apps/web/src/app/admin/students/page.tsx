"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Plus, Search } from "lucide-react";

export default function StudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", studentNumber: "", programId: "", yearOfStudy: "1" });

  useEffect(() => { if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login"); }, [user, isLoading, router]);
  const fetchData = async () => { const [s, p] = await Promise.all([api.get("/users/students"), api.get("/programs")]); setStudents(s.data.data); setPrograms(p.data.data); };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { ...form, role: "STUDENT", yearOfStudy: parseInt(form.yearOfStudy) });
      setShowForm(false); setForm({ email: "", password: "", firstName: "", lastName: "", studentNumber: "", programId: "", yearOfStudy: "1" }); fetchData();
    } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  const filtered = students.filter((s: any) => {
    const q = search.toLowerCase();
    return !q || s.firstName?.toLowerCase().includes(q) || s.lastName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.studentProfile?.studentNumber?.toLowerCase().includes(q);
  });

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Students</h1><p className="text-sm text-slate-500 mt-1">{students.length} total students</p></div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4 mr-1.5" /> Add Student</Button>
        </div>
        {showForm && (
          <Card><CardHeader><CardTitle className="text-lg">New Student</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Student Number</Label><Input value={form.studentNumber} onChange={(e) => setForm({ ...form, studentNumber: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Program</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} required>
                    <option value="">Select</option>{programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Year</Label><Input type="number" min="1" max="7" value={form.yearOfStudy} onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })} required /></div>
                <div className="col-span-2 flex gap-2"><Button type="submit" className="bg-slate-900 hover:bg-slate-800">Create</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        )}
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input className="pl-10" placeholder="Search by name, email, or student number..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Card><CardContent className="p-0"><div className="divide-y divide-slate-100">
          {filtered.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">{s.firstName?.[0]}{s.lastName?.[0]}</div>
                <div><p className="font-medium text-slate-900">{s.firstName} {s.lastName}</p><p className="text-sm text-slate-500">{s.email} | {s.studentProfile?.studentNumber || "N/A"}</p></div>
              </div>
              <Badge variant={s.isActive ? "success" : "destructive"}>{s.isActive ? "Active" : "Inactive"}</Badge>
            </div>
          ))}
          {filtered.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm text-slate-500">No students found.</p></div>}
        </div></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
