import { Link } from "react-router-dom";
import { useStudentEnrollments, useAttendanceSummary } from "../../hooks/useStudent";

function getAttendanceColor(percentage: number): string {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getAttendanceBg(percentage: number): string {
  if (percentage >= 75) return "bg-green-50";
  if (percentage >= 60) return "bg-yellow-50";
  return "bg-red-50";
}

export function DashboardPage() {
  const { data: enrollments, isLoading: enrollmentsLoading } = useStudentEnrollments();
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary();

  const isLoading = enrollmentsLoading || summaryLoading;

  const warningCourses =
    summary?.courses.filter((c) => c.percentage < 75 && c.totalSessions > 0) || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Student Dashboard</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{enrollments?.length || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
          <p className={`mt-1 text-3xl font-bold ${getAttendanceColor(summary?.overallPercentage || 0)}`}>
            {summary?.overallPercentage != null ? `${summary.overallPercentage.toFixed(1)}%` : "--"}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Below 75% Courses</p>
          <p className={`mt-1 text-3xl font-bold ${warningCourses.length > 0 ? "text-red-600" : "text-green-600"}`}>
            {warningCourses.length}
          </p>
        </div>
      </div>

      {warningCourses.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800">
            Warning: Your attendance is below 75% in the following courses
          </h3>
          <ul className="mt-2 list-inside list-disc text-sm text-red-700">
            {warningCourses.map((c) => (
              <li key={c.courseOfferingId}>
                {c.course.code} - {c.course.title} ({c.percentage.toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/student/checkin"
          className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Check In to Session
        </Link>
        <Link
          to="/student/attendance"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Detailed Attendance
        </Link>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-800">My Courses</h2>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-white" />
          ))}
        </div>
      ) : !enrollments || enrollments.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          You are not enrolled in any courses.{" "}
          <Link to="/student/enroll" className="text-blue-600 hover:underline">
            Enroll now
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Lecturer
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
              {enrollments.map((enrollment) => {
                const attendance = summary?.courses.find(
                  (c) => c.courseOfferingId === enrollment.courseOfferingId
                );
                const pct = attendance?.percentage ?? 0;
                return (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.courseOffering.course.code} - {enrollment.courseOffering.course.title}
                      </p>
                      <p className="text-xs text-gray-500">{enrollment.courseOffering.semester.name}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {enrollment.courseOffering.lecturer.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getAttendanceBg(
                          pct
                        )} ${getAttendanceColor(pct)}`}
                      >
                        {attendance ? `${pct.toFixed(1)}%` : "No sessions"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        to="/student/attendance"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
