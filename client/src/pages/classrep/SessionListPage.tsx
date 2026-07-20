import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useClassRepStatus,
  useSessions,
  useStartSession,
  useCloseSession,
  type ClassSession,
} from "../../hooks/useSessions";
import { useCourseOfferings, type CourseOffering } from "../../hooks/useCourseOfferings";

export function SessionListPage() {
  const { data: classRep, isLoading: repLoading } = useClassRepStatus();
  const { data: courseOfferings } = useCourseOfferings();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const startSession = useStartSession();
  const closeSession = useCloseSession();

  const [courseOfferingId, setCourseOfferingId] = useState("");
  const [date, setDate] = useState("");
  const [modeOfTeaching, setModeOfTeaching] = useState<"online" | "physical">("physical");
  const [startTime, setStartTime] = useState("");
  const [venue, setVenue] = useState("");
  const [topic, setTopic] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const isClassRep = !!classRep;

  const repCourseOfferings = courseOfferings?.filter(
    (co: CourseOffering) =>
      co.programmeId === classRep?.programmeId &&
      co.yearOfStudy === classRep?.yearOfStudy &&
      co.semesterId === classRep?.semesterId
  ) || [];

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      await startSession.mutateAsync({
        courseOfferingId,
        date,
        modeOfTeaching,
        startTime,
        venue: venue || undefined,
        topic: topic || undefined,
      });
      setFormSuccess("Session started successfully");
      setCourseOfferingId("");
      setDate("");
      setStartTime("");
      setVenue("");
      setTopic("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            "Failed to start session";
      setFormError(msg);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to close this session?")) return;
    try {
      await closeSession.mutateAsync(sessionId);
    } catch {
      // error handled by mutation
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  if (repLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white" />
        <div className="h-64 animate-pulse rounded-lg bg-white" />
      </div>
    );
  }

  if (!isClassRep) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Class Rep Sessions</h1>
        <div className="rounded-md bg-yellow-50 p-6 text-center">
          <p className="text-sm font-medium text-yellow-800">
            You are not assigned as a class representative.
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            Contact your administrator to be assigned as a class rep.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Class Rep Sessions</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Start New Session</h2>

        {formError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>
        )}
        {formSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{formSuccess}</div>
        )}

        <form onSubmit={handleStartSession} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Offering</label>
              <select
                value={courseOfferingId}
                onChange={(e) => setCourseOfferingId(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Course</option>
                {repCourseOfferings.map((co: CourseOffering) => (
                  <option key={co.id} value={co.id}>
                    {co.course?.code} - {co.course?.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mode</label>
              <select
                value={modeOfTeaching}
                onChange={(e) => setModeOfTeaching(e.target.value as "online" | "physical")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="physical">Physical</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Room 301"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Introduction to Chapter 3"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={startSession.isPending}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {startSession.isPending ? "Starting..." : "Start Session"}
            </button>
          </div>
        </form>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Past Sessions</h2>
      {sessionsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-white" />
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          No sessions found. Start your first session above.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Attendance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session: ClassSession) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatDate(session.date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {session.courseOffering?.course?.code || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        session.modeOfTeaching === "online"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {session.modeOfTeaching}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        session.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {session._count?.attendanceRecords ?? 0}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      to={`/classrep/sessions/${session.id}`}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    {session.status === "open" && (
                      <button
                        onClick={() => handleCloseSession(session.id)}
                        disabled={closeSession.isPending}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
