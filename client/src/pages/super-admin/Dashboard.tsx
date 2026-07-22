import { useAuth } from "@/contexts/AuthContext";
import { useSystemStats } from "@/hooks/useStats";
import { useFaculties } from "@/hooks/useFaculties";
import { useSessions } from "@/hooks/useSessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, GraduationCap, BookOpen, Building2, BookMarked, Radio,
} from "lucide-react";

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useSystemStats();
  const { faculties, isLoading: facultiesLoading } = useFaculties();
  const { sessions, isLoading: sessionsLoading } = useSessions();

  const isLoading = statsLoading || facultiesLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="System Overview" subtitle="Loading..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const roleData = [
    { name: "Students", value: stats?.totalStudents ?? 0 },
    { name: "Lecturers", value: stats?.totalLecturers ?? 0 },
    { name: "Admins", value: stats?.totalAdmins ?? 0 },
  ];

  const roleColors = ["#DC2626", "#FFCD00", "#1F2937"];

  const totalEnrolled = sessions.reduce((s: any, ss: any) => s + ss.totalEnrolled, 0);
  const totalSigned = sessions.reduce((s: any, ss: any) => s + ss.totalSignedIn, 0);
  const overallAttendance = totalEnrolled > 0 ? Math.round((totalSigned / totalEnrolled) * 100) : 0;

  const facultyAttendanceData = faculties.map((faculty: any) => ({
    name: faculty.name.replace("Faculty of ", ""),
    attendance: overallAttendance,
  }));

  const recentSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Students", value: stats?.totalStudents ?? 0, icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Lecturers", value: stats?.totalLecturers ?? 0, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Faculties", value: stats?.totalFaculties ?? 0, icon: Building2, color: "text-umu-red", bg: "bg-red-50" },
    { label: "Courses", value: stats?.totalCourses ?? 0, icon: BookMarked, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Open Sessions", value: stats?.openSessions ?? 0, icon: Radio, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const roleBadgeColor: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-800",
    closed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="System Overview"
        subtitle={
          <>
            Welcome back, <span className="font-medium text-gray-700">{user?.firstName} {user?.lastName}</span>. Here is your system overview.
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-base">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={roleColors[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance by Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={facultyAttendanceData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                <Bar dataKey="attendance" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
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
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Signed In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <p className="font-medium text-gray-900">{session.courseCode}</p>
                        <p className="text-xs text-gray-500">{session.courseName}</p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{session.date}</TableCell>
                      <TableCell className="text-sm text-gray-600">{session.topic}</TableCell>
                      <TableCell className="text-sm text-gray-600">{session.startedByName}</TableCell>
                      <TableCell>
                        <Badge className={roleBadgeColor[session.status]} variant="outline">
                          {session.status}
                        </Badge>
                      </TableCell>
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
