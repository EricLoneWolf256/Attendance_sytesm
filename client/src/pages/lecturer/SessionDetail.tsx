import { lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { useSessionDetail } from "@/hooks/useSessionDetail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SessionStatsCards,
  SessionInfoPanel,
  AttendanceRecordsTable,
} from "@/components/shared";
import {
  ArrowLeft,
  KeyRound,
  CheckCircle,
  FileDown,
  StopCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const QRCode = lazy(() =>
  import("@/components/lazy/QRCode").then((m) => ({ default: m.default }))
);

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    session,
    records,
    signedInCount,
    absentCount,
    attendancePct,
    isConfirmed,
    handleStopSession,
    handleConfirmSession,
  } = useSessionDetail(id);

  if (!session) {
    return (
      <div className="space-y-4">
        <Link
          to="/lecturer/sessions"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500">
            Session not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/lecturer/sessions"
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sessions
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {session.courseCode} - {session.courseName}
          </h1>
          <p className="text-sm text-gray-500">Session Details</p>
        </div>
        <div className="flex items-center gap-2">
          {isConfirmed ? (
            <Badge variant="success">
              <CheckCircle className="mr-1 h-3 w-3" />
              Confirmed
            </Badge>
          ) : (
            <Badge
              variant={session.status === "open" ? "success" : "secondary"}
            >
              {session.status === "open" ? "Open" : "Closed"}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {session.status === "open" && (
          <Button variant="destructive" size="sm" onClick={() => handleStopSession()}>
            <StopCircle className="mr-1 h-4 w-4" />
            Stop Session
          </Button>
        )}
        {session.status === "closed" && !isConfirmed && (
          <Button size="sm" onClick={() => handleConfirmSession()}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Confirm & Sign Off
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info("PDF export coming soon")}
        >
          <FileDown className="mr-1 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <SessionStatsCards
        totalEnrolled={session.totalEnrolled}
        signedIn={signedInCount}
        absent={absentCount}
        attendancePct={attendancePct}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SessionInfoPanel session={session} />
        </div>

        <div className="lg:col-span-2">
          {session.status === "open" && (
            <Card className="mb-6 border-green-200 bg-green-50/30">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <Suspense
                      fallback={
                        <div className="flex h-[160px] w-[160px] items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      }
                    >
                      <QRCode
                        value={JSON.stringify({
                          sessionId: session.id,
                          pin: session.pin,
                          courseCode: session.courseCode,
                        })}
                        size={160}
                        level="M"
                      />
                    </Suspense>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="mb-2 text-sm font-medium text-gray-500">
                      Session PIN
                    </p>
                    <p className="mb-4 flex items-center justify-center gap-2 text-5xl font-bold tracking-widest text-green-700 sm:justify-start">
                      <KeyRound className="h-8 w-8" />
                      {session.pin}
                    </p>
                    <p className="text-xs text-gray-500">
                      Students can scan the QR code or enter the PIN to sign
                      in.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Live - Listening for sign-ins
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <AttendanceRecordsTable records={records} />
        </div>
      </div>
    </div>
  );
}
