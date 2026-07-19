"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function FacultiesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [faculties, setFaculties] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login");
  }, [user, isLoading, router]);

  const fetchData = () => api.get("/faculties").then((res) => setFaculties(res.data.data));
  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/faculties/${editingId}`, { name, code });
      } else {
        await api.post("/faculties", { name, code });
      }
      setName(""); setCode(""); setEditingId(null); setShowForm(false);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty?")) return;
    await api.delete(`/faculties/${id}`);
    fetchData();
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Faculties</h1>
            <p className="text-sm text-slate-500 mt-1">Manage university faculties</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setName(""); setCode(""); }} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-1.5" /> Add Faculty
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-lg">{editingId ? "Edit Faculty" : "New Faculty"}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Faculty of Science" required />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Code</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., FOS" required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800">{editingId ? "Update" : "Create"}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {faculties.map((f) => (
                <div key={f.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                      {f.code}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{f.name}</p>
                      <p className="text-sm text-slate-500">{f.departments?.length || 0} departments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(f.id); setName(f.name); setCode(f.code); setShowForm(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {faculties.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-500">No faculties yet. Add your first faculty to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
