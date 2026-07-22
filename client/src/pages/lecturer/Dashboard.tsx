import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSessions";
import { useCourseOfferingsByLecturer } from "@/hooks/useCourses";
import { getAttendancePct } from "@/hooks/useAttendance";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import {
  BookOpen, Calendar, TrendingUp, ArrowRight,
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const { sessions, isLoading: sessionsLoading } = useSessions(user?.id);
  const { data: myOfferings = [], isLoading: offeringsLoading } = useCourseOfferingsByLecturer(user?.id);

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

  const totalSessions = sessions.length;
  const openSessions = sessions.filter((s: any) => s.status === "open");
  const totalSigned = sessions.reduce((sum: any, s: any) => sum + s.totalSignedIn, 0);
  const totalEnrolled = sessions.reduce((sum: any, s: any) => sum + s.totalEnrolled, 0);
  const avgAttendance = getAttendancePct(totalSigned, totalEnrolled);

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            Staff Number: {user?.staffNumber} &middot; Lecturer Dashboard
          </p>
        </div>
        <Link to="/lecturer/sessions">
          <Button>
            Start New Session
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Courses</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{myOfferings.length}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{totalSessions}</p>
                {openSessions.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-green-600">{openSessions.length} active</p>
                )}
              </div>
              <div className="rounded-xl bg-green-50 p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Attendance</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{avgAttendance}%</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={avgAttendance} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">My Courses</h2>
        {myOfferings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No courses assigned to you.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myOfferings.map((offering: any) => {
              const sessionCount = sessions.filter(
                (s: any) => s.courseOfferingId === offering.id
              ).length;
              return (
                <Card key={offering.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <p className="text-lg font-bold text-gray-900">{offering.courseId}</p>
                      <p className="text-sm text-gray-600 truncate">Course Offering</p>
                    </div>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p><span className="font-medium">Sessions:</span> {sessionCount}</p>
                    </div>
                    <div className="mt-4 border-t pt-3">
                      <Link to="/lecturer/sessions" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        View Sessions &rarr;
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">No sessions yet.</CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mode</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{session.courseCode}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">{session.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">{session.startTime}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={session.mode === "online" ? "info" : "purple"}>{session.mode}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <Badge variant={session.status === "open" ? "success" : "secondary"}>
                          {session.status === "open" ? "Open" : "Closed"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                        {session.totalSignedIn}/{session.totalEnrolled}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
