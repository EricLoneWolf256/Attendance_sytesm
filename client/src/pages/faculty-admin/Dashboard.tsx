import { useAuth } from "@/contexts/AuthContext";
import { useFacultyStats } from "@/hooks/useStats";

import { useSessions } from "@/hooks/useSessions";
import { courseService } from "@/lib/services/course.service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { BookOpen, Users, ClipboardList, TrendingUp } from "lucide-react";

export function FacultyDashboard() {
  const { user } = useAuth();
  const facultyId = user?.facultyId ?? "f1";

  const { data: faculty } = useQuery({
    queryKey: queryKeys.faculties.detail(facultyId),
    queryFn: () => import("@/lib/services/faculty.service").then((m) => m.facultyService.getById(facultyId)),
    enabled: !!facultyId,
  });

  const { data: stats, isLoading: statsLoading } = useFacultyStats(facultyId);
  const { data: facultyCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: queryKeys.courses.byFaculty(facultyId),
    queryFn: () => courseService.getAll({ departmentId: facultyId }).then((res: any) => res.filter((c: any) => c.facultyId === facultyId)),
    enabled: !!facultyId,
  });
  const { sessions, isLoading: sessionsLoading } = useSessions();

  const isLoading = statsLoading || coursesLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Faculty Dashboard" subtitle="Loading..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const courseAttendanceData = facultyCourses.map((course: any) => {
    const courseSessions = sessions.filter((s: any) => {
      const offering = sessions.find(() => true);
      return offering && s.courseCode === course.code;
    });
    const totalEnrolled = courseSessions.reduce((s: any, ss: any) => s + ss.totalEnrolled, 0);
    const totalSigned = courseSessions.reduce((s: any, ss: any) => s + ss.totalSignedIn, 0);
    const avg = courseSessions.length > 0 && totalEnrolled > 0
      ? Math.round((totalSigned / totalEnrolled) * 100)
      : 0;
    return { name: course.code, attendance: avg, title: course.title };
  });

  const recentSessions = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const statCards = [
    { label: "Total Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Students", value: stats?.totalStudents ?? 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Enrollments", value: stats?.totalEnrollments ?? 0, icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Avg Attendance", value: `${stats?.avgAttendance ?? 0}%`, icon: TrendingUp, color: "text-umu-red", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={(faculty as any)?.name ?? "Faculty Dashboard"}
        subtitle={
          <>
            Welcome back, <span className="font-medium text-gray-700">{user?.firstName} {user?.lastName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {courseAttendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={courseAttendanceData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Attendance"]}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${item.title} (${label})` : String(label);
                    }}
                  />
                  <Bar dataKey="attendance" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No course data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Signed In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{session.courseCode}</p>
                          <p className="text-xs text-gray-500">{session.courseName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{session.date}</TableCell>
                      <TableCell className="text-sm text-gray-600">{session.topic}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-gray-900">{session.totalSignedIn}</span>
                        <span className="text-gray-400">/{session.totalEnrolled}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No sessions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
