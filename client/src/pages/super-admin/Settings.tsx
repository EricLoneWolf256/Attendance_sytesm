import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, ShieldCheck, Clock, Timer } from "lucide-react";
import { toast } from "sonner";

export function SystemSettings() {
  const [minAttendance, setMinAttendance] = useState(75);
  const [lateThreshold, setLateThreshold] = useState(10);
  const [sessionDuration, setSessionDuration] = useState(90);

  return (
    <div className="space-y-8">
      <PageHeader
        title="System Settings"
        subtitle="Configure attendance policies and session defaults"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <ShieldCheck className="h-5 w-5 text-umu-red" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Attendance Policy
                </CardTitle>
                <CardDescription>
                  Set the minimum required attendance percentage
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Minimum Attendance Percentage
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={minAttendance}
                  onChange={(e) =>
                    setMinAttendance(
                      Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-32"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-400">
                Students below this threshold will be flagged for low attendance.
                Default: 75%
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current threshold</span>
                <span className="font-semibold text-gray-900">
                  {minAttendance}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    minAttendance >= 75 ? "bg-emerald-500" : minAttendance >= 50 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${minAttendance}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Late Threshold
                </CardTitle>
                <CardDescription>
                  Minutes after session start before a student is marked late
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Late Threshold (minutes)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={lateThreshold}
                  onChange={(e) =>
                    setLateThreshold(
                      Math.min(60, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-32"
                />
                <span className="text-sm text-gray-500">minutes</span>
              </div>
              <p className="text-xs text-gray-400">
                Students signing in after this window will be marked as late.
                Default: 10 minutes
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current threshold</span>
                <span className="font-semibold text-gray-900">
                  {lateThreshold} min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Session Duration
                </CardTitle>
                <CardDescription>
                  Default duration for class sessions in minutes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Default Duration (minutes)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={15}
                  max={300}
                  value={sessionDuration}
                  onChange={(e) =>
                    setSessionDuration(
                      Math.min(300, Math.max(15, parseInt(e.target.value) || 15))
                    )
                  }
                  className="w-32"
                />
                <span className="text-sm text-gray-500">minutes</span>
              </div>
              <p className="text-xs text-gray-400">
                Default session length. Lecturers can override when starting a
                session. Default: 90 minutes
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current duration</span>
                <span className="font-semibold text-gray-900">
                  {sessionDuration} min ({Math.floor(sessionDuration / 60)}h{" "}
                  {sessionDuration % 60}m)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          variant="umu"
          size="lg"
          onClick={() =>
            toast.success("System settings saved successfully")
          }
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
