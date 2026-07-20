import { useState } from "react";
import { useEnrollments, useCreateEnrollment, useBulkEnroll, useDeleteEnrollment } from "../../hooks/useEnrollments";
import { useUsers } from "../../hooks/useUsers";
import { useCourseOfferings } from "../../hooks/useCourseOfferings";

export function EnrollmentsPage() {
  const { data: enrollments, isLoading, error } = useEnrollments();
  const { data: students } = useUsers({ role: "STUDENT" });
  const { data: offerings } = useCourseOfferings();
  const createMutation = useCreateEnrollment();
  const bulkMutation = useBulkEnroll();
  const deleteMutation = useDeleteEnrollment();

  const [showModal, setShowModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [courseOfferingId, setCourseOfferingId] = useState("");
  const [bulkStudentIds, setBulkStudentIds] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const openCreate = () => {
    setBulkMode(false);
    setStudentId("");
    setCourseOfferingId("");
    setBulkStudentIds("");
    setFormError("");
    setSuccessMsg("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    try {
      if (bulkMode) {
        const ids = bulkStudentIds.split("\n").map((s) => s.trim()).filter(Boolean);
        if (ids.length === 0) {
          setFormError("Enter at least one student ID");
          return;
        }
        const result = await bulkMutation.mutateAsync({ courseOfferingId, studentIds: ids });
        setSuccessMsg(result.message);
        setBulkStudentIds("");
      } else {
        await createMutation.mutateAsync({ studentId, courseOfferingId });
        setShowModal(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setFormError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this enrollment?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Failed to delete enrollment");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
        <button onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Add Enrollment
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white" />)}</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Failed to load enrollments</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reg Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Programme</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Enrolled</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments?.map((en) => (
                <tr key={en.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{en.student?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{en.student?.regNumber ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{en.courseOffering?.course?.code} - {en.courseOffering?.course?.title}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{en.courseOffering?.programme?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{en.courseOffering?.semester?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(en.enrolledAt).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button onClick={() => handleDelete(en.id)} className="text-red-600 hover:text-red-800">Remove</button>
                  </td>
                </tr>
              ))}
              {enrollments?.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">No enrollments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Add Enrollment</h2>
            {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
            {successMsg && <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{successMsg}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Course Offering</label>
                <select value={courseOfferingId} onChange={(e) => setCourseOfferingId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select course offering</option>
                  {offerings?.map((o) => <option key={o.id} value={o.id}>{o.course?.code} - {o.programme?.name} (Year {o.yearOfStudy})</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bulkMode"
                  checked={bulkMode}
                  onChange={(e) => setBulkMode(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="bulkMode" className="text-sm font-medium text-gray-700">Bulk enroll (one student ID per line)</label>
              </div>
              {bulkMode ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student IDs (one per line)</label>
                  <textarea
                    value={bulkStudentIds}
                    onChange={(e) => setBulkStudentIds(e.target.value)}
                    rows={5}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={"STU001\nSTU002\nSTU003"}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student</label>
                  <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select student</option>
                    {students?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.regNumber ?? s.email})</option>)}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || bulkMutation.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {createMutation.isPending || bulkMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
