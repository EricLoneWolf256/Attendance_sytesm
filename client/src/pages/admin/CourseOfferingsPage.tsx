import { useState } from "react";
import { useCourseOfferings, useCreateCourseOffering, useUpdateCourseOffering, useDeleteCourseOffering, type CourseOffering } from "../../hooks/useCourseOfferings";
import { useCourses } from "../../hooks/useCourses";
import { useProgrammes } from "../../hooks/useProgrammes";
import { useSemesters } from "../../hooks/useAcademic";
import { useUsers } from "../../hooks/useUsers";

export function CourseOfferingsPage() {
  const { data: offerings, isLoading, error } = useCourseOfferings();
  const { data: courses } = useCourses();
  const { data: programmes } = useProgrammes();
  const { data: semesters } = useSemesters();
  const { data: lecturers } = useUsers({ role: "LECTURER" });
  const createMutation = useCreateCourseOffering();
  const updateMutation = useUpdateCourseOffering();
  const deleteMutation = useDeleteCourseOffering();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CourseOffering | null>(null);
  const [courseId, setCourseId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [semesterId, setSemesterId] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [formError, setFormError] = useState("");

  const openCreate = () => {
    setEditing(null);
    setCourseId("");
    setProgrammeId("");
    setYearOfStudy(1);
    setSemesterId("");
    setLecturerId("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (o: CourseOffering) => {
    setEditing(o);
    setCourseId(o.courseId);
    setProgrammeId(o.programmeId);
    setYearOfStudy(o.yearOfStudy);
    setSemesterId(o.semesterId);
    setLecturerId(o.lecturerId);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, courseId, programmeId, yearOfStudy, semesterId, lecturerId });
      } else {
        await createMutation.mutateAsync({ courseId, programmeId, yearOfStudy, semesterId, lecturerId });
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setFormError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course offering?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Failed to delete course offering");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Course Offerings</h1>
        <button onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Add Course Offering
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white" />)}</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Failed to load course offerings</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Programme</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lecturer</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offerings?.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{o.course?.code} - {o.course?.title}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{o.programme?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Year {o.yearOfStudy}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{o.semester?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{o.lecturer?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button onClick={() => openEdit(o)} className="mr-3 text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(o.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
              {offerings?.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No course offerings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{editing ? "Edit Course Offering" : "Create Course Offering"}</h2>
            {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select course</option>
                    {courses?.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Programme</label>
                  <select value={programmeId} onChange={(e) => setProgrammeId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select programme</option>
                    {programmes?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                  <select value={yearOfStudy} onChange={(e) => setYearOfStudy(Number(e.target.value))} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select semester</option>
                    {semesters?.map((s) => <option key={s.id} value={s.id}>{s.academicYear?.label} - {s.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Lecturer</label>
                  <select value={lecturerId} onChange={(e) => setLecturerId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select lecturer</option>
                    {lecturers?.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
