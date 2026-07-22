import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { enrollmentService } from "@/lib/services/attendance.service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getAttendancePct } from "@/hooks/useAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function FacultyReports() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const debouncedSearch = useDebounce(search);

  const { courses: facultyCourses, isLoading: coursesLoading } = useCourses(user?.facultyId ?? undefined);

  const offeringIds = useMemo(
    () => facultyCourses.map((c: any) => c.id),
    [facultyCourses]
  );

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: [...queryKeys.attendance.byStudent("faculty"), user?.facultyId],
    queryFn: () => enrollmentService.getAll({ courseOfferingId: offeringIds[0] }) as any,
    enabled: offeringIds.length > 0,
  });

  const isLoading = coursesLoading || enrollmentsLoading;

  const studentMap = useMemo(() => {
    const map: Record<string, {
      studentId: string;
      courses: { courseCode: string; courseName: string; attended: number; total: number; pct: number }[];
      totalAttended: number;
      totalSessions: number;
      avgPct: number;
    }> = {};

    for (const e of enrollments) {
      const key = e.studentId;
      if (!map[key]) {
        map[key] = { studentId: key, courses: [], totalAttended: 0, totalSessions: 0, avgPct: 0 };
      }
      const pct = getAttendancePct(e.attendedSessions, e.totalSessions);
      map[key].courses.push({
        courseCode: e.courseCode,
        courseName: e.courseName,
        attended: e.attendedSessions,
        total: e.totalSessions,
        pct,
      });
      map[key].totalAttended += e.attendedSessions;
      map[key].totalSessions += e.totalSessions;
    }

    for (const key of Object.keys(map)) {
      const s = map[key];
      s.avgPct = getAttendancePct(s.totalAttended, s.totalSessions);
    }

    return map;
  }, [enrollments]);

  const enrichedStudents = useMemo(() => {
    return Object.values(studentMap).map((s) => ({
      ...s,
      name: `Student ${s.studentId}`,
      regNumber: "",
    }));
  }, [studentMap]);

  const displayStudents = useMemo(() => {
    const filtered = debouncedSearch
      ? enrichedStudents.filter(
          (s) =>
            s.studentId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            s.courses.some((c) =>
              c.courseCode.toLowerCase().includes(debouncedSearch.toLowerCase())
            )
        )
      : enrichedStudents;

    if (selectedCourse === "all") return filtered;
    return filtered.filter((s) =>
      s.courses.some((c) => c.courseCode === selectedCourse)
    );
  }, [enrichedStudents, debouncedSearch, selectedCourse]);

  const belowThreshold = useMemo(
    () => displayStudents.filter((s) => s.avgPct < 75),
    [displayStudents]
  );

  const allStudentsReport = useMemo(() => {
    const rows: { studentId: string; courseCode: string; courseName: string; attended: number; total: number; pct: number }[] = [];

    for (const e of enrollments) {
      const pct = getAttendancePct(e.attendedSessions, e.totalSessions);
      rows.push({
        studentId: e.studentId,
        courseCode: e.courseCode,
        courseName: e.courseName,
        attended: e.attendedSessions,
        total: e.totalSessions,
        pct,
      });
    }

    let filtered = rows;
    if (debouncedSearch) {
      filtered = filtered.filter(
        (r) =>
          r.studentId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          r.courseCode.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    if (selectedCourse !== "all") {
      filtered = filtered.filter((r) => r.courseCode === selectedCourse);
    }
    return filtered;
  }, [enrollments, debouncedSearch, selectedCourse]);

  const getStudentName = (studentId: string) => {
    const names: Record<string, string> = {
      u4: "Alice Johnson", u5: "Edward Kayiira", u6: "Grace Nambi",
      u7: "Moses Ssemwanga", u8: "Patricia Among",
    };
    return names[studentId] ?? studentId;
  };

  const getRegNumber = (studentId: string) => {
    const regs: Record<string, string> = {
      u4: "20/U/0001", u5: "20/U/0002", u6: "20/U/0003",
      u7: "20/U/0004", u8: "21/U/0010",
    };
    return regs[studentId] ?? "";
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Faculty Reports" subtitle="Student attendance reports for your faculty" />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by student name or reg number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {facultyCourses.map((c: any) => (
                  <SelectItem key={c.id} value={c.code}>{c.code} - {c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="umu" onClick={() => toast.success("Report exported successfully")}>
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Attendance Results</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Reg Number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Sessions Attended</TableHead>
                  <TableHead className="text-center">Total Sessions</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStudentsReport.length > 0 ? (
                  allStudentsReport.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-gray-900">{getStudentName(row.studentId)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{getRegNumber(row.studentId)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{row.courseCode}</p>
                          <p className="text-xs text-gray-500">{row.courseName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{row.attended}</TableCell>
                      <TableCell className="text-center">{row.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={row.pct}
                            className="h-2 w-20"
                            indicatorClassName={row.pct >= 75 ? "bg-emerald-500" : row.pct >= 50 ? "bg-amber-500" : "bg-red-500"}
                          />
                          <span className={`text-sm font-semibold ${row.pct >= 75 ? "text-emerald-600" : row.pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {row.pct}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-gray-400">No records found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {belowThreshold.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-800">
              <AlertTriangle className="h-5 w-5" /> Students Below 75% Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {belowThreshold.map((student) => (
                <div key={student.studentId} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{getStudentName(student.studentId)}</p>
                    <p className="text-xs text-gray-500">{getRegNumber(student.studentId)}</p>
                  </div>
                  <Badge variant={student.avgPct < 50 ? "destructive" : "warning"}>
                    {student.avgPct}% attendance
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
