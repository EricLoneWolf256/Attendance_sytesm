import { useState } from "react";
import { Link } from "react-router-dom";
import { useLecturerSessions, useConfirmSession } from "../../hooks/useLecturer";

export function LecturerSessionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: sessions, isLoading } = useLecturerSessions(
    statusFilter ? { status: statusFilter } : undefined
  );
  const confirmSession = useConfirmSession();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return "--";
    try {
      return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return iso;
    }
  };

  const handleConfirm = async (sessionId: string) => {
    if (!confirm("Are you sure you want to confirm this session's attendance?")) return;
    try {
      await confirmSession.mutateAsync(sessionId);
    } catch {
      // handled by mutation
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-sm text-gray-600">Manage and review attendance sessions for your courses.</p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">
          No sessions found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mode
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Attendance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Confirmed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {formatDate(session.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {session.courseOffering?.course?.code}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {formatTime(session.startTime)}
                    {session.endTime ? ` - ${formatTime(session.endTime)}` : ""}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
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
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">
                    {session._count?.attendanceRecords ?? 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
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
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {session.lecturerConfirmedAt ? (
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                        No
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      to={`/lecturer/sessions/${session.id}`}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    {session.status === "closed" && !session.lecturerConfirmedAt && (
                      <button
                        onClick={() => handleConfirm(session.id)}
                        disabled={confirmSession.isPending}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        Confirm
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
