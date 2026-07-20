import { Link } from "react-router-dom";
import { useLecturerOfferings, useLecturerSessions } from "../../hooks/useLecturer";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#FF0000", "#FFCD00", "#0A0A0A", "#6B7280"];

function formatTime(iso: string | null | undefined) {
  if (!iso) return "--";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return iso;
  }
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "--";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function DashboardPage() {
  const { data: offerings, isLoading: offeringsLoading } = useLecturerOfferings();
  const { data: sessions, isLoading: sessionsLoading } = useLecturerSessions();

  const isLoading = offeringsLoading || sessionsLoading;

  const totalSessions = sessions?.length ?? 0;
  const openSessions = sessions?.filter((s) => s.status === "open").length ?? 0;
  const closedSessions = sessions?.filter((s) => s.status === "closed").length ?? 0;
  const totalAttendance = sessions?.reduce((sum, s) => sum + (s._count?.attendanceRecords ?? 0), 0) ?? 0;
  const confirmedSessions = sessions?.filter((s) => s.lecturerConfirmedAt).length ?? 0;

  const statusData = [
    { name: "Open", value: openSessions },
    { name: "Closed", value: closedSessions },
  ].filter((d) => d.value > 0);

  const confirmedData = [
    { name: "Confirmed", value: confirmedSessions },
    { name: "Not Confirmed", value: totalSessions - confirmedSessions },
  ].filter((d) => d.value > 0);

  const attendancePerSession = sessions
    ?.filter((s) => s.status === "closed")
    .slice(-8)
    .map((s) => ({
      name: s.courseOffering?.course?.code ?? "N/A",
      attendees: s._count?.attendanceRecords ?? 0,
    })) ?? [];

  const sessionsByMode = (() => {
    const counts: Record<string, number> = {};
    sessions?.forEach((s) => { counts[s.modeOfTeaching] = (counts[s.modeOfTeaching] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  })();

  const statusBadge: Record<string, string> = {
    open: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <img src="/UMU-logo.png" alt="UMU" className="h-10 w-10 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
          <p className="text-sm text-gray-500">
            Your assigned course offerings and session statistics.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100" />
            <div className="h-72 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100" />
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-umu-red/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Sessions</span>
                <svg className="h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">{totalSessions}</p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Open Sessions</span>
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-green-600">{openSessions}</p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-gray-400/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Closed Sessions</span>
                <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-600">{closedSessions}</p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-umu-red/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Attendees</span>
                <svg className="h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <p className="mt-3 text-3xl font-bold text-umu-red">{totalAttendance}</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Session Status</h2>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ value: v }) => `${v}`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No sessions yet</p>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Lecturer Confirmation</h2>
              {confirmedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={confirmedData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ value: v }) => `${v}`}>
                      {confirmedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No data yet</p>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Attendance per Closed Session</h2>
              {attendancePerSession.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={attendancePerSession}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`${value}`, "Attendees"]} />
                    <Bar dataKey="attendees" fill="#FF0000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No closed sessions yet</p>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Sessions by Mode</h2>
              {sessionsByMode.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={sessionsByMode} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ value: v }) => `${v}`}>
                      {sessionsByMode.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No data yet</p>
              )}
            </div>
          </div>

          {/* Course Offerings */}
          {offerings && offerings.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Your Course Offerings</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offerings.map((offering) => (
                  <div
                    key={offering.id}
                    className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-umu-red/20"
                  >
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-gray-900">{offering.course?.code}</h3>
                      <p className="text-sm text-gray-600 truncate">{offering.course?.title}</p>
                    </div>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p><span className="font-medium">Programme:</span> {offering.programme?.name}</p>
                      <p><span className="font-medium">Semester:</span> {offering.semester?.name}</p>
                    </div>
                    <div className="mt-4 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{offering._count?.sessions ?? 0}</p>
                          <p className="text-xs text-gray-500">Sessions</p>
                        </div>
                        <Link
                          to="/lecturer/sessions"
                          className="rounded-lg bg-umu-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-umu-red-dark hover:shadow-md"
                        >
                          View Sessions
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Sessions Table */}
          {sessions && sessions.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Recent Sessions</h2>
              <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Attendees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessions.slice(0, 10).map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{s.courseOffering?.course?.code}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(s.date)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatTime(s.startTime)} - {formatTime(s.endTime)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 capitalize">{s.modeOfTeaching}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[s.status] ?? ""}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{s._count?.attendanceRecords ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
