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

export default function DepartmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login");
  }, [user, isLoading, router]);

  const fetchData = async () => {
    const [d, f] = await Promise.all([api.get("/departments"), api.get("/faculties")]);
    setDepartments(d.data.data);
    setFaculties(f.data.data);
  };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/departments/${editingId}`, { name, code, facultyId }); }
      else { await api.post("/departments", { name, code, facultyId }); }
      setName(""); setCode(""); setFacultyId(""); setEditingId(null); setShowForm(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    await api.delete(`/departments/${id}`); fetchData();
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Departments</h1><p className="text-sm text-slate-500 mt-1">Manage departments within faculties</p></div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setName(""); setCode(""); setFacultyId(""); }} className="bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4 mr-1.5" /> Add Department</Button>
        </div>
        {showForm && (
          <Card><CardHeader><CardTitle className="text-lg">{editingId ? "Edit" : "New"} Department</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 items-end">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Faculty</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required>
                    <option value="">Select Faculty</option>{faculties.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-2"><Button type="submit" className="bg-slate-900 hover:bg-slate-800">{editingId ? "Update" : "Create"}</Button><Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        )}
        <Card><CardContent className="p-0"><div className="divide-y divide-slate-100">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">{d.code}</div>
                <div><p className="font-medium text-slate-900">{d.name}</p><p className="text-sm text-slate-500">Faculty: {d.faculty?.name} | {d.programs?.length || 0} programs</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(d.id); setName(d.name); setCode(d.code); setFacultyId(d.facultyId); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {departments.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm text-slate-500">No departments yet.</p></div>}
        </div></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
