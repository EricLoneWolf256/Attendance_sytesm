import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSessions";
import { useCourseOfferings } from "@/hooks/useCourses";
import { getAttendancePct } from "@/hooks/useAttendance";
import { attendanceService } from "@/lib/services/attendance.service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import {
  Users, TrendingUp, Clock, MapPin, ArrowRight, BookOpen,
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const { sessions, isLoading: sessionsLoading } = useSessions();
  const { data: allOfferings = [], isLoading: offeringsLoading } = useCourseOfferings();

  const isLoading = sessionsLoading || offeringsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const myCourseOfferings = allOfferings.filter(
    (co: any) => co.lecturerId === user?.id || co.programmeId === user?.programmeId
  );

  const mySessions = sessions.filter(
    (s: any) =>
      myCourseOfferings.some((co: any) => co.id === s.courseOfferingId) ||
      s.startedById === user?.id
  );

  const openSessions = mySessions.filter((s: any) => s.status === "OPEN");
  const recentSessions = [...mySessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalSignedIn = mySessions.reduce((sum: any, s: any) => sum + s.totalSignedIn, 0);
  const totalEnrolled = mySessions.reduce((sum: any, s: any) => sum + s.totalEnrolled, 0);
  const attendanceRate = getAttendancePct(totalSignedIn, totalEnrolled);

  const activeSession = openSessions[0];

  const { data: activeSessionRecords = [] } = useQuery({
    queryKey: queryKeys.attendance.activeSession(activeSession?.id ?? ""),
    queryFn: () => attendanceService.getAll({ sessionId: activeSession!.id }) as any,
    enabled: !!activeSession,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName} {user?.lastName} - Class Representative
          </h1>
          <p className="text-sm text-gray-500">
            Manage your class sessions and track attendance.
          </p>
        </div>
        <Link to="/classrep/sessions">
          <Button>
            Go to Sessions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{openSessions.length}</p>
              </div>
              <div className="rounded-xl bg-green-50 p-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Programme Students</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{totalEnrolled}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{attendanceRate}%</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={attendanceRate} />
            </div>
          </CardContent>
        </Card>
      </div>

      {activeSession && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-900">Active Session</CardTitle>
              <Badge variant="success">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Course</p>
                <p className="text-sm font-semibold text-gray-900">
                  {activeSession.courseCode} - {activeSession.courseName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Time</p>
                <p className="text-sm font-semibold text-gray-900">{activeSession.startTime}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Venue</p>
                <p className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <MapPin className="h-3 w-3" />
                  {activeSession.venue}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Signed In</p>
                <p className="text-sm font-semibold text-green-700">
                  {activeSessionRecords.length + activeSession.totalSignedIn} / {activeSession.totalEnrolled}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/classrep/sessions">
                <Button size="sm">
                  Go to Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No sessions found. Start your first session from the Sessions page.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <BookOpen className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {session.courseCode} - {session.courseName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.date} at {session.startTime} &middot; {session.venue}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {session.totalSignedIn}/{session.totalEnrolled} present
                      </span>
                      <Badge variant={session.status === "OPEN" ? "success" : "secondary"}>
                        {session.status === "OPEN" ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
