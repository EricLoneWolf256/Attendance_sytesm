import { useState } from "react";
import { useFaculties } from "@/hooks/useFaculties";
import { useDepartments } from "@/hooks/useDepartments";
import { useProgrammes } from "@/hooks/useProgrammes";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";

export function FacultyManagement() {
  const [activeTab, setActiveTab] = useState("faculties");
  const { faculties, isLoading: facultiesLoading, createFaculty, updateFaculty, deleteFaculty } = useFaculties();
  const { departments, isLoading: deptsLoading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { programmes, isLoading: progsLoading, createProgramme, updateProgramme, deleteProgramme } = useProgrammes();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ type: string; id: string; name: string; extra?: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    departmentId: "d1",
    facultyId: "f1",
    level: "undergraduate",
  });

  const getDeptCount = (facultyId: string) =>
    departments.filter((d: any) => d.facultyId === facultyId).length;

  const getProgCount = (facultyId: string) => {
    const deptIds = departments.filter((d: any) => d.facultyId === facultyId).map((d: any) => d.id);
    return programmes.filter((p: any) => deptIds.includes(p.departmentId)).length;
  };

  const getProgsByDept = (deptId: string) =>
    programmes.filter((p: any) => p.departmentId === deptId).length;

  const getFacultyName = (facultyId: string) =>
    faculties.find((f: any) => f.id === facultyId)?.name ?? "-";

  const getDeptName = (deptId: string) =>
    departments.find((d: any) => d.id === deptId)?.name ?? "-";

  const tabTitles: Record<string, string> = {
    faculties: "Faculties",
    departments: "Departments",
    programmes: "Programmes",
  };

  const addDialogTitle = () => {
    switch (activeTab) {
      case "faculties": return "Add New Faculty";
      case "departments": return "Add New Department";
      case "programmes": return "Add New Programme";
      default: return "Add";
    }
  };

  const handleAdd = () => {
    if (!formData.name.trim()) return;

    if (activeTab === "faculties") {
      createFaculty.mutate(
        { name: formData.name, campusId: "c1" },
        { onSuccess: () => { setAddOpen(false); setFormData({ name: "", departmentId: "d1", facultyId: "f1", level: "undergraduate" }); } }
      );
    } else if (activeTab === "departments") {
      createDepartment.mutate(
        { name: formData.name, facultyId: formData.facultyId },
        { onSuccess: () => { setAddOpen(false); setFormData({ name: "", departmentId: "d1", facultyId: "f1", level: "undergraduate" }); } }
      );
    } else {
      createProgramme.mutate(
        { name: formData.name, departmentId: formData.departmentId, level: formData.level },
        { onSuccess: () => { setAddOpen(false); setFormData({ name: "", departmentId: "d1", facultyId: "f1", level: "undergraduate" }); } }
      );
    }
  };

  const openEdit = (type: string, id: string, name: string, extra?: string) => {
    setEditTarget({ type, id, name, extra });
    setFormData({ ...formData, name, facultyId: extra || "f1", departmentId: extra || "d1" });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!formData.name.trim() || !editTarget) return;

    if (editTarget.type === "faculty") {
      updateFaculty.mutate(
        { id: editTarget.id, data: { name: formData.name } },
        { onSuccess: () => { setEditOpen(false); setEditTarget(null); } }
      );
    } else if (editTarget.type === "department") {
      updateDepartment.mutate(
        { id: editTarget.id, data: { name: formData.name, facultyId: formData.facultyId } },
        { onSuccess: () => { setEditOpen(false); setEditTarget(null); } }
      );
    } else if (editTarget.type === "programme") {
      updateProgramme.mutate(
        { id: editTarget.id, data: { name: formData.name, departmentId: formData.departmentId, level: formData.level as any } },
        { onSuccess: () => { setEditOpen(false); setEditTarget(null); } }
      );
    }
  };

  const openDelete = (type: string, id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "faculty") {
      deleteFaculty.mutate(deleteTarget.id, {
        onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null); },
      });
    } else if (deleteTarget.type === "department") {
      deleteDepartment.mutate(deleteTarget.id, {
        onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null); },
      });
    } else if (deleteTarget.type === "programme") {
      deleteProgramme.mutate(deleteTarget.id, {
        onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null); },
      });
    }
  };

  const isLoading = facultiesLoading || deptsLoading || progsLoading;
  const isMutating = createFaculty.isPending || updateFaculty.isPending || deleteFaculty.isPending
    || createDepartment.isPending || updateDepartment.isPending || deleteDepartment.isPending
    || createProgramme.isPending || updateProgramme.isPending || deleteProgramme.isPending;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Faculty Management" subtitle="Manage faculties, departments, and programmes" />
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Faculty Management"
        subtitle="Manage faculties, departments, and programmes"
      />

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between border-b px-6 pt-6">
              <TabsList>
                <TabsTrigger value="faculties">
                  Faculties<Badge variant="outline" className="ml-2">{faculties.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="departments">
                  Departments<Badge variant="outline" className="ml-2">{departments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="programmes">
                  Programmes<Badge variant="outline" className="ml-2">{programmes.length}</Badge>
                </TabsTrigger>
              </TabsList>
              <Button variant="umu" size="sm" onClick={() => { setFormData({ name: "", departmentId: "d1", facultyId: "f1", level: "undergraduate" }); setAddOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />Add {tabTitles[activeTab]?.replace(/s$/, "")}
              </Button>
            </div>

            <div className="p-6">
              <TabsContent value="faculties" className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Departments</TableHead>
                      <TableHead className="text-center">Programmes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculties.map((faculty: any) => (
                      <TableRow key={faculty.id}>
                        <TableCell className="font-medium text-gray-900">{faculty.name}</TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{getDeptCount(faculty.id)}</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{getProgCount(faculty.id)}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit("faculty", faculty.id, faculty.name)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDelete("faculty", faculty.id, faculty.name)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="departments" className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead className="text-center">Programmes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept: any) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium text-gray-900">{dept.name}</TableCell>
                        <TableCell className="text-sm text-gray-600">{getFacultyName(dept.facultyId)}</TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{getProgsByDept(dept.id)}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit("department", dept.id, dept.name, dept.facultyId)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDelete("department", dept.id, dept.name)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="programmes" className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programmes.map((prog: any) => (
                      <TableRow key={prog.id}>
                        <TableCell className="font-medium text-gray-900">{prog.name}</TableCell>
                        <TableCell className="text-sm text-gray-600">{getDeptName(prog.departmentId)}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{prog.level}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit("programme", prog.id, prog.name, prog.departmentId)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDelete("programme", prog.id, prog.name)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{addDialogTitle()}</DialogTitle>
            <DialogDescription>Fill in the details below to add a new {activeTab.replace(/s$/, "")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input placeholder={`Enter ${activeTab.replace(/s$/, "")} name`} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            {activeTab === "departments" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Faculty</label>
                <Select value={formData.facultyId} onValueChange={(v) => setFormData({ ...formData, facultyId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {faculties.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {activeTab === "programmes" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Level</label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="umu" onClick={handleAdd} disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.type}</DialogTitle>
            <DialogDescription>Update the name below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            {editTarget?.type === "department" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Faculty</label>
                <Select value={formData.facultyId} onValueChange={(v) => setFormData({ ...formData, facultyId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {faculties.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {editTarget?.type === "programme" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Level</label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="umu" onClick={handleEdit} disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
