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

export default function ProgramsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("Undergraduate");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login"); }, [user, isLoading, router]);
  const fetchData = async () => { const [p, d] = await Promise.all([api.get("/programs"), api.get("/departments")]); setPrograms(p.data.data); setDepartments(d.data.data); };
  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/programs/${editingId}`, { name, code, departmentId, level }); }
      else { await api.post("/programs", { name, code, departmentId, level }); }
      setName(""); setCode(""); setDepartmentId(""); setEditingId(null); setShowForm(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Programs</h1><p className="text-sm text-slate-500 mt-1">Manage academic programs</p></div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setName(""); setCode(""); setDepartmentId(""); }} className="bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4 mr-1.5" /> Add Program</Button>
        </div>
        {showForm && (
          <Card><CardHeader><CardTitle className="text-lg">{editingId ? "Edit" : "New"} Program</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 items-end">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Department</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                    <option value="">Select</option>{departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-2"><Button type="submit" className="bg-slate-900 hover:bg-slate-800">{editingId ? "Update" : "Create"}</Button><Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        )}
        <Card><CardContent className="p-0"><div className="divide-y divide-slate-100">
          {programs.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">{p.code}</div>
                <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-sm text-slate-500">Dept: {p.department?.name} | Level: {p.level}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(p.id); setName(p.name); setCode(p.code); setDepartmentId(p.departmentId); setLevel(p.level); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={async () => { if (confirm("Delete?")) { await api.delete(`/programs/${p.id}`); fetchData(); } }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {programs.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm text-slate-500">No programs yet.</p></div>}
        </div></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
