import { useAuth } from "@/contexts/AuthContext";
import { useStudentAttendance, getAttendancePct, getAttendanceColor } from "@/hooks/useAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function StudentHistory() {
  const { user } = useAuth();
  const { enrollments, overallRate, belowThreshold, totalAttended, totalSessions } = useStudentAttendance(user?.id ?? "");
  const overallColor = getAttendanceColor(overallRate);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>

      {belowThreshold.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Attendance Warning</p>
            <p className="text-sm text-amber-700 mt-0.5">
              {belowThreshold.length} course{belowThreshold.length > 1 ? "s" : ""} below 75% threshold:{" "}
              {belowThreshold.map((e: any) => e.courseCode).join(", ")}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Overall Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={overallRate} className="h-4 flex-1" />
            <span className={`text-2xl font-bold ${overallColor.text}`}>{overallRate}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {totalAttended} sessions attended out of {totalSessions} total
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {enrollments.map((e: any) => {
          const rate = getAttendancePct(e.attendedSessions, e.totalSessions);
          const color = getAttendanceColor(rate);
          return (
            <Card key={e.id} className={`${color.border} border`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{e.courseCode} - {e.courseName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{e.lecturerName}</p>
                  </div>
                  <Badge className={`${color.bg} ${color.text} hover:${color.bg}`}>{rate}%</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={rate} className="h-3 flex-1" />
                  <span className="text-sm text-gray-500 w-28 text-right">
                    {e.attendedSessions}/{e.totalSessions} sessions
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
