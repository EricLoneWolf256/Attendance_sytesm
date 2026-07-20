import { useAttendanceSummary } from "../../hooks/useStudent";

function getAttendanceColor(percentage: number): string {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getAttendanceBg(percentage: number): string {
  if (percentage >= 75) return "bg-green-50 border-green-200";
  if (percentage >= 60) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

function getAttendanceBarColor(percentage: number): string {
  if (percentage >= 75) return "bg-green-500";
  if (percentage >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export function MyAttendancePage() {
  const { data: summary, isLoading, error } = useAttendanceSummary();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Attendance</h1>

      {summary?.overallPercentage != null && (
        <div
          className={`mb-6 rounded-lg border p-6 ${getAttendanceBg(summary.overallPercentage)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
              <p className={`text-3xl font-bold ${getAttendanceColor(summary.overallPercentage)}`}>
                {summary.overallPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="h-4 w-48 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${getAttendanceBarColor(summary.overallPercentage)}`}
                style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
              />
            </div>
          </div>
          {summary.overallPercentage < 75 && (
            <p className="mt-2 text-sm text-red-700">
              Your overall attendance is below the 75% minimum threshold.
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load attendance data.
        </div>
      ) : !summary || summary.courses.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          No attendance data available. Enroll in courses and attend sessions to see your attendance.
        </div>
      ) : (
        <div className="space-y-4">
          {summary.courses.map((course) => (
            <div
              key={course.courseOfferingId}
              className={`rounded-lg border bg-white p-5 shadow-sm ${
                course.totalSessions > 0
                  ? course.percentage >= 75
                    ? "border-green-200"
                    : course.percentage >= 60
                    ? "border-yellow-200"
                    : "border-red-200"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {course.course.code} - {course.course.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.attended} / {course.totalSessions} sessions attended
                  </p>
                </div>
                <div className="text-right">
                  {course.totalSessions > 0 ? (
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getAttendanceBg(
                        course.percentage
                      )} ${getAttendanceColor(course.percentage)}`}
                    >
                      {course.percentage.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                      No sessions
                    </span>
                  )}
                </div>
              </div>
              {course.totalSessions > 0 && (
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${getAttendanceBarColor(course.percentage)}`}
                      style={{ width: `${Math.min(course.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {course.totalSessions > 0 && course.percentage < 75 && (
                <p className="mt-2 text-xs text-red-600">
                  Below 75% threshold. Attend more sessions to meet the requirement.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
