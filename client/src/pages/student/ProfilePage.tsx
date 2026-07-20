import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCampuses, type Campus } from "../../hooks/useCampuses";
import { useFaculties, type Faculty } from "../../hooks/useFaculties";
import { useProgrammes, type Programme } from "../../hooks/useProgrammes";
import { useStudentProfile, useUpdateProfile } from "../../hooks/useStudent";

export function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: campuses } = useCampuses();
  const { data: faculties } = useFaculties();
  const { data: programmes } = useProgrammes();
  const updateProfile = useUpdateProfile();

  const [regNumber, setRegNumber] = useState("");
  const [campusId, setCampusId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState<number>(1);
  const [gender, setGender] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setRegNumber(profile.regNumber || "");
      setCampusId(profile.campusId || user?.campusId || "");
      setFacultyId(profile.facultyId || "");
      setProgrammeId(profile.programmeId || "");
      setYearOfStudy(profile.yearOfStudy || 1);
      setGender(profile.gender || "");
    } else if (user) {
      setCampusId(user.campusId || "");
      setFacultyId(user.facultyId || "");
      setProgrammeId(user.programmeId || "");
      setYearOfStudy(user.yearOfStudy || 1);
      setGender(user.gender || "");
    }
  }, [profile, user]);

  const filteredFaculties = faculties?.filter((f: Faculty) => f.campusId === campusId) || [];
  const filteredProgrammes = programmes?.filter(
    (p: Programme) => p.department && (p.department as unknown as { facultyId: string }).facultyId === facultyId
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await updateProfile.mutateAsync({
        regNumber,
        campusId,
        facultyId,
        programmeId,
        yearOfStudy,
        gender,
      });
      setFeedback({ type: "success", message: "Profile updated successfully" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update profile";
      setFeedback({ type: "error", message: msg });
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {feedback && (
        <div
          className={`mb-4 rounded-md p-4 text-sm ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="rounded-lg bg-white shadow">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={user?.name || ""}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. 2024/CS/001"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Campus</label>
              <select
                value={campusId}
                onChange={(e) => {
                  setCampusId(e.target.value);
                  setFacultyId("");
                  setProgrammeId("");
                }}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Campus</option>
                {campuses?.map((c: Campus) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Faculty</label>
              <select
                value={facultyId}
                onChange={(e) => {
                  setFacultyId(e.target.value);
                  setProgrammeId("");
                }}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Faculty</option>
                {filteredFaculties.map((f: Faculty) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Programme</label>
              <select
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Programme</option>
                {filteredProgrammes.map((p: Programme) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year of Study</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateProfile.isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
