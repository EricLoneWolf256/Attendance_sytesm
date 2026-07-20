import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession, useCloseSession } from "../../hooks/useSessions";
import { useSessionAttendance, type AttendanceRecord } from "../../hooks/useAttendance";
import { useSocket } from "../../hooks/useSocket";

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = id || "";
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: attendance, isLoading: attendanceLoading } = useSessionAttendance(sessionId);
  const closeSession = useCloseSession();
  const { socket, isConnected, joinSession, leaveSession } = useSocket();

  const [liveRecords, setLiveRecords] = useState<AttendanceRecord[]>([]);

  const handleStudentSignedIn = useCallback((record: AttendanceRecord) => {
    setLiveRecords((prev) => {
      if (prev.some((r) => r.id === record.id)) return prev;
      return [...prev, record];
    });
  }, []);

  useEffect(() => {
    if (!socket || !sessionId) return;

    joinSession(sessionId);
    socket.on("student-signed-in", handleStudentSignedIn);

    return () => {
      leaveSession(sessionId);
      socket.off("student-signed-in", handleStudentSignedIn);
    };
  }, [socket, sessionId, joinSession, leaveSession, handleStudentSignedIn]);

  useEffect(() => {
    if (attendance?.records) {
      setLiveRecords([]);
    }
  }, [attendance]);

  const allRecords = [...(attendance?.records || []), ...liveRecords];

  const handleClose = async () => {
    if (!confirm("Are you sure you want to close this session?")) return;
    try {
      await closeSession.mutateAsync(sessionId);
    } catch {
      // error handled by mutation
    }
  };

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

  const formatSignInTime = (timeStr: string | null) => {
    if (!timeStr) return "--";
    return formatTime(timeStr);
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

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/classrep/sessions" className="text-sm text-blue-600 hover:text-blue-800">
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
            <button
              onClick={() => {
                const csvContent = [
                  ["No.", "Name", "Reg Number", "Gender", "Sign In Time", "Status"],
                  ...allRecords.map((r, i) => [
                    String(i + 1),
                    r.student.name,
                    r.student.regNumber || "N/A",
                    r.student.gender || "N/A",
                    formatSignInTime(r.signedInAt),
                    r.status,
                  ]),
                ]
                  .map((row) => row.join(","))
                  .join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `attendance-${session.courseOffering?.course?.code || "session"}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Download CSV
            </button>
            {session.status === "open" && (
              <button
                onClick={handleClose}
                disabled={closeSession.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {closeSession.isPending ? "Closing..." : "Close Session"}
              </button>
            )}
          </div>
        </div>
      </div>

      {session.status === "open" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium text-green-800">
              {isConnected
                ? "Live - Listening for sign-ins..."
                : "Connecting to live feed..."}
            </span>
          </div>
          {liveRecords.length > 0 && (
            <p className="mt-2 text-sm text-green-700">
              {liveRecords.length} new sign-in{liveRecords.length !== 1 ? "s" : ""} received
            </p>
          )}
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Attendance Record ({allRecords.length} {allRecords.length === 1 ? "student" : "students"})
      </h2>

      {attendanceLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-white" />
          ))}
        </div>
      ) : allRecords.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-4 text-center text-sm text-gray-600">
          No attendance records yet. Waiting for students to sign in.
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
              {allRecords.map((record, index) => (
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
                    {formatSignInTime(record.signedInAt)}
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
