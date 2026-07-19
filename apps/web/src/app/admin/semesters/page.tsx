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
import { Plus, Calendar } from "lucide-react";

export default function SemestersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [semesters, setSemesters] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => { if (!isLoading && (!user || user.role !== "ADMIN")) router.push("/login"); }, [user, isLoading, router]);
  const fetchData = () => api.get("/semesters").then((res) => setSemesters(res.data.data));
  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post("/semesters", { name, startDate, endDate, isActive }); setName(""); setStartDate(""); setEndDate(""); setIsActive(false); setShowForm(false); fetchData(); }
    catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Semesters</h1><p className="text-sm text-slate-500 mt-1">Manage academic semesters</p></div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4 mr-1.5" /> Add Semester</Button>
        </div>
        {showForm && (
          <Card><CardHeader><CardTitle className="text-lg">New Semester</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Semester 1, 2026" required /></div>
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
                <div className="col-span-2 flex items-center gap-2"><input type="checkbox" id="active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" /><Label htmlFor="active">Set as active semester</Label></div>
                <div className="col-span-2 flex gap-2"><Button type="submit" className="bg-slate-900 hover:bg-slate-800">Create</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4">
          {semesters.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><Calendar className="h-5 w-5 text-slate-600" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <Badge variant={s.isActive ? "success" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()} | {s.courses?.length || 0} courses</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {semesters.length === 0 && <Card><CardContent className="py-12 text-center"><p className="text-sm text-slate-500">No semesters yet.</p></CardContent></Card>}
        </div>
      </div>
    </DashboardLayout>
  );
}
