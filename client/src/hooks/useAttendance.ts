import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService, enrollmentService } from "@/lib/services/attendance.service";
import { queryKeys } from "@/lib/queryKeys";

export function useStudentAttendance(studentId: string) {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: queryKeys.attendance.byStudent(studentId),
    queryFn: () => enrollmentService.getAll({ studentId }) as any,
    enabled: !!studentId,
  });

  const { data: _attendanceRecords = [] } = useQuery({
    queryKey: [...queryKeys.attendance.byStudent(studentId), "records"],
    queryFn: () => attendanceService.getAll({ studentId }) as any,
    enabled: !!studentId,
  });

  const overallRate = useMemo(() => {
    if (!enrollments.length) return 0;
    const totalEnrolled = enrollments.reduce(
      (sum: number, e: any) => sum + (e.totalSessions ?? 0),
      0
    );
    const totalAttended = enrollments.reduce(
      (sum: number, e: any) => sum + (e.attendedSessions ?? 0),
      0
    );
    return totalEnrolled > 0 ? Math.round((totalAttended / totalEnrolled) * 100) : 0;
  }, [enrollments]);

  const belowThreshold = useMemo(
    () =>
      enrollments.filter(
        (e: any) =>
          e.totalSessions > 0 &&
          (e.attendedSessions / e.totalSessions) * 100 < 75
      ),
    [enrollments]
  );

  const totalAttended = useMemo(
    () => enrollments.reduce((sum: number, e: any) => sum + (e.attendedSessions ?? 0), 0),
    [enrollments]
  );

  const totalSessions = useMemo(
    () => enrollments.reduce((sum: number, e: any) => sum + (e.totalSessions ?? 0), 0),
    [enrollments]
  );

  return {
    enrollments,
    overallRate,
    belowThreshold,
    totalAttended,
    totalSessions,
    isLoading,
  };
}

export function getAttendancePct(
  signedIn: number,
  enrolled: number
): number {
  return enrolled > 0 ? Math.round((signedIn / enrolled) * 100) : 0;
}

export function getAttendanceColor(pct: number) {
  if (pct >= 75)
    return {
      bar: "bg-green-500",
      text: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
    };
  if (pct >= 60)
    return {
      bar: "bg-amber-500",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    };
  return {
    bar: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  };
}
