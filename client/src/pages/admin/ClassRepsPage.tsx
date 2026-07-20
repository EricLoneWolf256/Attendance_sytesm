import { useState } from "react";
import { useClassReps, useAssignClassRep, useRemoveClassRep } from "../../hooks/useClassReps";
import { useUsers } from "../../hooks/useUsers";
import { useProgrammes } from "../../hooks/useProgrammes";
import { useSemesters } from "../../hooks/useAcademic";

export function ClassRepsPage() {
  const { data: classReps, isLoading, error } = useClassReps();
  const { data: students } = useUsers({ role: "STUDENT" });
  const { data: programmes } = useProgrammes();
  const { data: semesters } = useSemesters();
  const assignMutation = useAssignClassRep();
  const removeMutation = useRemoveClassRep();

  const [showModal, setShowModal] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [semesterId, setSemesterId] = useState("");
  const [formError, setFormError] = useState("");

  const openCreate = () => {
    setStudentId("");
    setProgrammeId("");
    setYearOfStudy(1);
    setSemesterId("");
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      await assignMutation.mutateAsync({ studentId, programmeId, yearOfStudy, semesterId });
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setFormError(msg);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this class rep assignment?")) return;
    try {
      await removeMutation.mutateAsync(id);
    } catch {
      alert("Failed to remove class rep");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Class Representatives</h1>
        <button onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Assign Class Rep
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white" />)}</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Failed to load class reps</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reg Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Programme</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Assigned By</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classReps?.map((cr) => (
                <tr key={cr.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{cr.student?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cr.student?.regNumber ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cr.programme?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Year {cr.yearOfStudy}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cr.semester?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cr.assigner?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button onClick={() => handleRemove(cr.id)} className="text-red-600 hover:text-red-800">Remove</button>
                  </td>
                </tr>
              ))}
              {classReps?.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">No class rep assignments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Assign Class Rep</h2>
            {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select student</option>
                  {students?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.regNumber ?? s.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Programme</label>
                <select value={programmeId} onChange={(e) => setProgrammeId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select programme</option>
                  {programmes?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={assignMutation.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {assignMutation.isPending ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
