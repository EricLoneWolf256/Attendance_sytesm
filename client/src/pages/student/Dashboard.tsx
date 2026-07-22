import { useAuth } from "@/contexts/AuthContext";
import { useStudentAttendance, getAttendancePct } from "@/hooks/useAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, TrendingUp, AlertTriangle, QrCode, History } from "lucide-react";
import { Link } from "react-router-dom";

export function StudentDashboard() {
  const { user } = useAuth();
  const { enrollments, overallRate, belowThreshold } = useStudentAttendance(user?.id ?? "");

  if (!user) return null;

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 75) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Good</Badge>;
    if (rate >= 60) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">At Risk</Badge>;
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Critical</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
        <p className="text-red-100 mt-1">Student Number: {user.studentNumber}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold">{enrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overall Attendance</p>
                <p className="text-2xl font-bold">{overallRate}%</p>
              </div>
            </div>
            <Progress value={overallRate} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Below 75% Warning</p>
                <p className="text-2xl font-bold">{belowThreshold.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link to="/student/checkin">
          <Button className="bg-red-600 hover:bg-red-700">
            <QrCode className="w-4 h-4 mr-2" /> Check In Now
          </Button>
        </Link>
        <Link to="/student/history">
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" /> View History
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((e: any) => {
                const rate = getAttendancePct(e.attendedSessions, e.totalSessions);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.courseCode}</TableCell>
                    <TableCell>{e.courseName}</TableCell>
                    <TableCell className="text-gray-500">{e.lecturerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Progress value={rate} className="h-2 flex-1" />
                        <span className="text-sm font-medium w-10 text-right">{rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getAttendanceStatus(rate)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
