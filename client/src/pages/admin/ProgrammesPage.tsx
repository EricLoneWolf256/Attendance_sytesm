import { useState } from "react";
import { useProgrammes, useCreateProgramme, useUpdateProgramme, useDeleteProgramme, type Programme } from "../../hooks/useProgrammes";
import { useDepartments } from "../../hooks/useDepartments";

const LEVELS = ["undergraduate", "postgraduate", "diploma"] as const;

export function ProgrammesPage() {
  const { data: programmes, isLoading, error } = useProgrammes();
  const { data: departments } = useDepartments();
  const createMutation = useCreateProgramme();
  const updateMutation = useUpdateProgramme();
  const deleteMutation = useDeleteProgramme();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Programme | null>(null);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState<string>("undergraduate");
  const [formError, setFormError] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDepartmentId("");
    setLevel("undergraduate");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (prog: Programme) => {
    setEditing(prog);
    setName(prog.name);
    setDepartmentId(prog.departmentId);
    setLevel(prog.level);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, name, departmentId, level });
      } else {
        await createMutation.mutateAsync({ name, departmentId, level });
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setFormError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this programme?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Failed to delete programme");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Programmes</h1>
        <button onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Add Programme
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white" />)}</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Failed to load programmes</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Level</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {programmes?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.department?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.level === "undergraduate" ? "bg-blue-100 text-blue-800" : p.level === "postgraduate" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                    }`}>{p.level}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button onClick={() => openEdit(p)} className="mr-3 text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
              {programmes?.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No programmes found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{editing ? "Edit Programme" : "Create Programme"}</h2>
            {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select department</option>
                  {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
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
