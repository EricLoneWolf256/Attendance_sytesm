import { useAttendanceSummary } from "../../hooks/useStudent";

function getBarColor(percentage: number): string {
  if (percentage >= 75) return "bg-green-500";
  if (percentage >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function getStatusColor(percentage: number): string {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function StudentReportsPage() {
  const { data: summary, isLoading, error } = useAttendanceSummary();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Attendance Reports</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-white shadow" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load attendance data.
        </div>
      ) : !summary || summary.courses.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">
          No attendance data available yet. Enroll in courses and attend sessions.
        </div>
      ) : (
        <>
          {summary.overallPercentage < 75 && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    Attention: Your overall attendance is below the 75% minimum threshold
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Current overall attendance: {summary.overallPercentage.toFixed(1)}%. 
                    Attend more sessions to meet the requirement.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-2 text-sm font-medium text-gray-500">Overall Attendance</h2>
            <div className="flex items-center gap-4">
              <span className={`text-3xl font-bold ${getStatusColor(summary.overallPercentage)}`}>
                {summary.overallPercentage.toFixed(1)}%
              </span>
              <div className="flex-1">
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(summary.overallPercentage)}`}
                    style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">Per Course</h2>
          <div className="space-y-4">
            {summary.courses.map((course) => (
              <div
                key={course.courseOfferingId}
                className="rounded-lg bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {course.course.code} - {course.course.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {course.attended} of {course.totalSessions} sessions attended
                    </p>
                  </div>
                  <span
                    className={`text-lg font-bold ${getStatusColor(course.percentage)}`}
                  >
                    {course.totalSessions > 0 ? `${course.percentage.toFixed(1)}%` : "N/A"}
                  </span>
                </div>
                {course.totalSessions > 0 && (
                  <>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(course.percentage)}`}
                        style={{ width: `${Math.min(course.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>75% threshold</span>
                      <span>100%</span>
                    </div>
                  </>
                )}
                {course.totalSessions > 0 && course.percentage < 75 && (
                  <div className="mt-3 rounded-md bg-red-50 px-3 py-2">
                    <p className="text-xs font-medium text-red-700">
                      Below 75% threshold. You need to attend {(Math.ceil(0.75 * course.totalSessions) - course.attended)} more session(s) to meet the requirement.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
