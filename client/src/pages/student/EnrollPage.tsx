import { useAuth } from "../../contexts/AuthContext";
import {
  useAvailableCourses,
  useStudentEnrollments,
  useEnrollCourse,
  useUnenrollCourse,
  type AvailableCourse,
} from "../../hooks/useStudent";

export function EnrollPage() {
  const { user } = useAuth();
  const { data: availableCourses, isLoading: coursesLoading } = useAvailableCourses({
    programmeId: user?.programmeId || undefined,
    yearOfStudy: user?.yearOfStudy || undefined,
  });
  const { data: enrollments, isLoading: enrollmentsLoading } = useStudentEnrollments();
  const enrollMutation = useEnrollCourse();
  const unenrollMutation = useUnenrollCourse();

  const enrolledOfferingIds = new Set(enrollments?.map((e) => e.courseOfferingId) || []);

  const handleEnroll = async (courseOfferingId: string) => {
    try {
      await enrollMutation.mutateAsync({ courseOfferingId });
    } catch {
      // error handled by mutation
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to unenroll from this course?")) return;
    try {
      await unenrollMutation.mutateAsync(enrollmentId);
    } catch {
      // error handled by mutation
    }
  };

  const isEnrolled = (offeringId: string) => enrolledOfferingIds.has(offeringId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Course Enrollment</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Available Courses</h2>
        {coursesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-white" />
            ))}
          </div>
        ) : !availableCourses || availableCourses.length === 0 ? (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
            No available courses found for your programme and year of study.
          </div>
        ) : (
          <div className="space-y-3">
            {availableCourses.map((course: AvailableCourse) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {course.course.code} - {course.course.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {course.course.creditUnits} Credit Units | Lecturer: {course.lecturer.name} |{" "}
                    {course.semester.name}
                  </p>
                </div>
                <div>
                  {isEnrolled(course.id) ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollMutation.isPending}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {enrollMutation.isPending ? "Enrolling..." : "Enroll"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">My Enrolled Courses</h2>
        {enrollmentsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-white" />
            ))}
          </div>
        ) : !enrollments || enrollments.length === 0 ? (
          <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
            You are not enrolled in any courses yet.
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {enrollment.courseOffering.course.code} - {enrollment.courseOffering.course.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {enrollment.courseOffering.course.creditUnits} Credit Units | Lecturer:{" "}
                    {enrollment.courseOffering.lecturer.name}
                  </p>
                </div>
                <button
                  onClick={() => handleUnenroll(enrollment.id)}
                  disabled={unenrollMutation.isPending}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {unenrollMutation.isPending ? "Removing..." : "Unenroll"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
