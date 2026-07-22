import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useCourses, useDepartments } from "@/hooks/useCourses";
import type { Course } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";

export function CourseManagement() {
  const { courses, isLoading: coursesLoading, isError: coursesError, createCourse, updateCourse, deleteCourse } = useCourses();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<Course | null>(null);

  const debouncedSearch = useDebounce(search);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    creditUnits: 3,
    departmentId: "d1",
  });

  const getDeptName = (deptId: string) =>
    departments.find((d: any) => d.id === deptId)?.name ?? "-";

  const filteredCourses = useMemo(
    () => courses.filter(
      (c: any) =>
        debouncedSearch === "" ||
        c.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [courses, debouncedSearch]
  );

  const handleAdd = () => {
    createCourse.mutate(
      {
        code: formData.code,
        title: formData.title,
        creditUnits: formData.creditUnits,
        departmentId: formData.departmentId,
      },
      {
        onSuccess: () => {
          setAddOpen(false);
          setFormData({ code: "", title: "", creditUnits: 3, departmentId: "d1" });
        },
      }
    );
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setFormData({ code: course.code, title: course.title, creditUnits: course.creditUnits, departmentId: course.departmentId });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editCourse) return;
    updateCourse.mutate(
      {
        id: editCourse.id,
        data: { code: formData.code, title: formData.title, creditUnits: formData.creditUnits, departmentId: formData.departmentId },
      },
      { onSuccess: () => { setEditOpen(false); setEditCourse(null); } }
    );
  };

  const openDelete = (course: Course) => {
    setDeleteCourseTarget(course);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteCourseTarget) return;
    deleteCourse.mutate(deleteCourseTarget.id, {
      onSuccess: () => { setDeleteOpen(false); setDeleteCourseTarget(null); },
    });
  };

  const isMutating = createCourse.isPending || updateCourse.isPending || deleteCourse.isPending;

  if (coursesError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Course Management" subtitle="Manage all courses across departments" />
        <Card>
          <CardContent className="py-12 text-center text-sm text-red-500">
            Failed to load courses. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Management"
        subtitle="Manage all courses across departments"
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search courses by code or title..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button variant="umu" onClick={() => { setFormData({ code: "", title: "", creditUnits: 3, departmentId: "d1" }); setAddOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />Add Course
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-center">Credit Units</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course: any) => (
                    <TableRow key={course.id}>
                      <TableCell><Badge variant="outline" className="font-mono">{course.code}</Badge></TableCell>
                      <TableCell className="font-medium text-gray-900">{course.title}</TableCell>
                      <TableCell className="text-center text-sm text-gray-600">{course.creditUnits}</TableCell>
                      <TableCell className="text-sm text-gray-600">{getDeptName(course.departmentId)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(course)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(course)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-400">No courses found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Fill in the details to create a new course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Course Code</label>
              <Input placeholder="e.g. CS201" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Course Title</label>
              <Input placeholder="e.g. Data Structures & Algorithms" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Credit Units</label>
              <Input type="number" min={1} max={6} value={formData.creditUnits} onChange={(e) => setFormData({ ...formData, creditUnits: parseInt(e.target.value) || 3 })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {deptsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    departments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="umu" onClick={handleAdd} disabled={isMutating}>
              {createCourse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the course details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Course Code</label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Course Title</label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Credit Units</label>
              <Input type="number" min={1} max={6} value={formData.creditUnits} onChange={(e) => setFormData({ ...formData, creditUnits: parseInt(e.target.value) || 3 })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {deptsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    departments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="umu" onClick={handleEdit} disabled={isMutating}>
              {updateCourse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              Are you sure you want to delete <strong>{deleteCourseTarget?.code} - {deleteCourseTarget?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isMutating}>
              {deleteCourse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
