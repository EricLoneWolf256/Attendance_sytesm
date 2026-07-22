import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions, useSessionForm } from "@/hooks/useSessions";
import { useCourseOfferings } from "@/hooks/useCourses";
import { SessionCreateDialog } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus, Calendar, MapPin, KeyRound, StopCircle, Eye,
} from "lucide-react";

export function Sessions() {
  const { user } = useAuth();
  const { sessions, openSessions, startSession, stopSession } = useSessions();
  const { formData, updateField, dialogOpen, openDialog, closeDialog } = useSessionForm();
  const { data: allOfferings = [] } = useCourseOfferings();

  const onSubmit = () => {
    startSession.mutate(
      { formData, user },
      { onSuccess: () => closeDialog() }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="text-sm text-gray-500">Create and manage your class attendance sessions.</p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="mr-2 h-4 w-4" /> Start New Session
        </Button>
      </div>

      {openSessions.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Active Sessions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {openSessions.map((session: any) => (
              <Card key={session.id} className="border-green-200 bg-green-50/30 transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{session.courseCode}</p>
                      <p className="text-sm text-gray-600">{session.courseName}</p>
                    </div>
                    <Badge variant="success">Open</Badge>
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> {session.date} at {session.startTime}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> {session.venue} ({session.mode})
                    </p>
                  </div>

                  <div className="mb-4 rounded-lg border border-green-300 bg-white p-4 text-center">
                    <p className="mb-1 text-xs font-medium text-gray-500">Session PIN</p>
                    <p className="flex items-center justify-center gap-2 text-3xl font-bold tracking-widest text-green-700">
                      <KeyRound className="h-5 w-5" /> {session.pin}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {session.totalSignedIn} / {session.totalEnrolled} signed in
                    </span>
                    <div className="flex gap-2">
                      <Link to={`/classrep/sessions/${session.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      <Button size="sm" variant="destructive" onClick={() => stopSession.mutate(session.id)}>
                        <StopCircle className="mr-1 h-3.5 w-3.5" /> Stop
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">All Sessions</h2>
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No sessions yet. Click "Start New Session" to create one.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Venue</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Attendance</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessions.map((session: any) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-900">{session.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{session.courseCode}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">{session.startTime}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={session.mode === "ONLINE" ? "info" : "purple"}>{session.mode}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">{session.venue}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <Badge variant={session.status === "OPEN" ? "success" : "secondary"}>
                          {session.status === "OPEN" ? "Open" : "Closed"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                        {session.totalSignedIn}/{session.totalEnrolled}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/classrep/sessions/${session.id}`}>
                            <Button size="sm" variant="ghost">View</Button>
                          </Link>
                          {session.status === "OPEN" && (
                            <Button size="sm" variant="destructive" onClick={() => stopSession.mutate(session.id)}>
                              Stop
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <SessionCreateDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        formData={formData}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        courseOfferings={allOfferings}
      />
    </div>
  );
}
