import { useState } from "react";
import {
  useAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useCreateSemester,
  useUpdateSemester,
  type AcademicYear,
  type Semester,
} from "../../hooks/useAcademic";

export function AcademicPage() {
  const { data: years, isLoading: yearsLoading, error: yearsError } = useAcademicYears();
  const createYearMutation = useCreateAcademicYear();
  const updateYearMutation = useUpdateAcademicYear();
  const createSemMutation = useCreateSemester();
  const updateSemMutation = useUpdateSemester();

  const [showYearModal, setShowYearModal] = useState(false);
  const [yearLabel, setYearLabel] = useState("");
  const [yearIsCurrent, setYearIsCurrent] = useState(false);
  const [yearFormError, setYearFormError] = useState("");

  const [showSemModal, setShowSemModal] = useState(false);
  const [semAcademicYearId, setSemAcademicYearId] = useState("");
  const [semName, setSemName] = useState("");
  const [semIntakeMonth, setSemIntakeMonth] = useState("");
  const [semIsActive, setSemIsActive] = useState(false);
  const [semFormError, setSemFormError] = useState("");
  const [semSuccess, setSemSuccess] = useState("");

  const openYearModal = () => {
    setYearLabel("");
    setYearIsCurrent(false);
    setYearFormError("");
    setShowYearModal(true);
  };

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setYearFormError("");
    try {
      await createYearMutation.mutateAsync({ label: yearLabel, isCurrent: yearIsCurrent });
      setShowYearModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setYearFormError(msg);
    }
  };

  const handleToggleYearCurrent = async (year: AcademicYear) => {
    try {
      await updateYearMutation.mutateAsync({ id: year.id, isCurrent: !year.isCurrent });
    } catch {
      alert("Failed to update academic year");
    }
  };

  const openSemModal = (yearId?: string) => {
    setSemAcademicYearId(yearId ?? "");
    setSemName("");
    setSemIntakeMonth("");
    setSemIsActive(false);
    setSemFormError("");
    setSemSuccess("");
    setShowSemModal(true);
  };

  const handleSemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSemFormError("");
    setSemSuccess("");
    try {
      const result = await createSemMutation.mutateAsync({
        academicYearId: semAcademicYearId,
        name: semName,
        intakeMonth: semIntakeMonth || undefined,
        isActive: semIsActive,
      });
      setSemSuccess(`Semester "${result.name}" created`);
      setSemName("");
      setSemIntakeMonth("");
      setSemIsActive(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setSemFormError(msg);
    }
  };

  const handleToggleSemActive = async (semester: Semester) => {
    try {
      await updateSemMutation.mutateAsync({ id: semester.id, isActive: !semester.isActive });
    } catch {
      alert("Failed to update semester");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Academic Structure</h1>
        <p className="text-sm text-gray-600">Manage academic years and semesters</p>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Academic Years</h2>
          <button onClick={openYearModal} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Add Academic Year
          </button>
        </div>

        {yearsLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded bg-white" />)}</div>
        ) : yearsError ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Failed to load academic years</div>
        ) : (
          <div className="space-y-4">
            {years?.map((year) => (
              <div key={year.id} className="rounded-lg bg-white p-5 shadow">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{year.label}</h3>
                    {year.isCurrent && (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Current</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleYearCurrent(year)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {year.isCurrent ? "Unset Current" : "Set Current"}
                    </button>
                    <button
                      onClick={() => openSemModal(year.id)}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      + Add Semester
                    </button>
                  </div>
                </div>

                {year.semesters && year.semesters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Intake Month</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                          <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {year.semesters.map((sem) => (
                          <tr key={sem.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{sem.name}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{sem.intakeMonth ?? "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                sem.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {sem.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                              <button
                                onClick={() => handleToggleSemActive(sem)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {sem.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No semesters yet</p>
                )}
              </div>
            ))}
            {years?.length === 0 && (
              <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500 shadow">
                No academic years found. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>

      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Academic Year</h2>
            {yearFormError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{yearFormError}</div>}
            <form onSubmit={handleYearSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Label</label>
                <input type="text" value={yearLabel} onChange={(e) => setYearLabel(e.target.value)} required placeholder="e.g. 2025/2026" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="yearIsCurrent" checked={yearIsCurrent} onChange={(e) => setYearIsCurrent(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="yearIsCurrent" className="text-sm font-medium text-gray-700">Set as current year</label>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowYearModal(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createYearMutation.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {createYearMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Semester</h2>
            {semFormError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{semFormError}</div>}
            {semSuccess && <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{semSuccess}</div>}
            <form onSubmit={handleSemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                <select value={semAcademicYearId} onChange={(e) => setSemAcademicYearId(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select academic year</option>
                  {years?.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={semName} onChange={(e) => setSemName(e.target.value)} required placeholder="e.g. Semester 1" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Intake Month</label>
                <input type="text" value={semIntakeMonth} onChange={(e) => setSemIntakeMonth(e.target.value)} placeholder="e.g. September" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="semIsActive" checked={semIsActive} onChange={(e) => setSemIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="semIsActive" className="text-sm font-medium text-gray-700">Set as active semester</label>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowSemModal(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createSemMutation.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {createSemMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
