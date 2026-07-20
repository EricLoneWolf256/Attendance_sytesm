import { useParams, Link } from "react-router-dom";
import { useLecturerSessionDetail, useConfirmSession } from "../../hooks/useLecturer";
import { useSessionAttendance } from "../../hooks/useAttendance";

export function LecturerSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = id || "";
  const { data: session, isLoading: sessionLoading } = useLecturerSessionDetail(sessionId);
  const { data: attendance, isLoading: attendanceLoading } = useSessionAttendance(sessionId);
  const confirmSession = useConfirmSession();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const handleConfirm = async () => {
    if (!confirm("Are you sure you want to confirm this session's attendance?")) return;
    try {
      await confirmSession.mutateAsync(sessionId);
    } catch {
      // handled by mutation
    }
  };

  if (sessionLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white" />
        <div className="h-40 animate-pulse rounded-lg bg-white" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Session not found.</div>
    );
  }

  const records = attendance?.records || [];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/lecturer/sessions" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Sessions
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Session Details</h1>

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {session.courseOffering?.course?.code} - {session.courseOffering?.course?.title}
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600 sm:grid-cols-3">
              <p>
                <span className="font-medium">Date:</span> {formatDate(session.date)}
              </p>
              <p>
                <span className="font-medium">Time:</span> {formatTime(session.startTime)}
              </p>
              <p>
                <span className="font-medium">Venue:</span> {session.venue || "N/A"}
              </p>
              <p>
                <span className="font-medium">Mode:</span>{" "}
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    session.modeOfTeaching === "online"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {session.modeOfTeaching}
                </span>
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    session.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {session.status}
                </span>
              </p>
              {session.topic && (
                <p>
                  <span className="font-medium">Topic:</span> {session.topic}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {session.status === "closed" && !session.lecturerConfirmedAt && (
              <button
                onClick={handleConfirm}
                disabled={confirmSession.isPending}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {confirmSession.isPending ? "Confirming..." : "Confirm Session"}
              </button>
            )}
            {session.lecturerConfirmedAt && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                Confirmed
              </span>
            )}
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Attendance ({records.length} {records.length === 1 ? "student" : "students"})
      </h2>

      {attendanceLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-white" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-4 text-center text-sm text-gray-600">
          No attendance records for this session.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reg Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sign In Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {record.student.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {record.student.regNumber || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {record.student.gender || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {record.signedInAt ? formatTime(record.signedInAt) : "--"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.status === "present"
                          ? "bg-green-100 text-green-700"
                          : record.status === "late"
                          ? "bg-yellow-100 text-yellow-700"
                          : record.status === "excused"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.status}
                    </span>
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
