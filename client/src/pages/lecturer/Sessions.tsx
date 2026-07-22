import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions, useSessionForm } from "@/hooks/useSessions";
import { useCourseOfferingsByLecturer } from "@/hooks/useCourses";
import { getAttendancePct } from "@/hooks/useAttendance";
import { SessionCreateDialog } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

export function Sessions() {
  const { user } = useAuth();
  const { sessions, startSession } = useSessions(user?.id);
  const { formData, updateField, dialogOpen, openDialog, closeDialog } = useSessionForm();
  const { data: myOfferings = [] } = useCourseOfferingsByLecturer(user?.id);
  const [activeTab, setActiveTab] = useState("all");

  const filteredSessions =
    activeTab === "all"
      ? sessions
      : sessions.filter((s: any) => s.status === activeTab);

  const onSubmit = () => {
    startSession.mutate(
      { formData, user },
      { onSuccess: () => closeDialog() }
    );
  };

  const handleConfirmSession = (_sessionId: string) => {
    toast.success("Session confirmed and signed off");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-sm text-gray-500">
            Manage and review attendance sessions for your courses.
          </p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Start New Session
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open ({sessions.filter((s: any) => s.status === "open").length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({sessions.filter((s: any) => s.status === "closed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-gray-500">
                No sessions found.
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
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Venue</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Attendance %</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredSessions.map((session: any) => {
                      const pct = getAttendancePct(session.totalSignedIn, session.totalEnrolled);
                      return (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {session.date}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{session.courseCode}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Badge variant={session.mode === "online" ? "info" : "purple"}>{session.mode}</Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-500">{session.venue}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <Badge variant={session.status === "open" ? "success" : "secondary"}>
                              {session.status === "open" ? "Open" : "Closed"}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <span className={`font-medium ${pct >= 75 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/lecturer/sessions/${session.id}`}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="mr-1 h-3.5 w-3.5" /> View
                                </Button>
                              </Link>
                              {session.status === "closed" && (
                                <Button size="sm" variant="outline" onClick={() => handleConfirmSession(session.id)}>
                                  <CheckCircle className="mr-1 h-3.5 w-3.5" /> Confirm
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <SessionCreateDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        formData={formData}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        courseOfferings={myOfferings}
      />
    </div>
  );
}
