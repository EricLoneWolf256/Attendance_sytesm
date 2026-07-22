import type { ClassSession } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Monitor } from "lucide-react";

interface SessionInfoPanelProps {
  session: ClassSession;
}

export function SessionInfoPanel({ session }: SessionInfoPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Session Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{new Date(session.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            {new Date(session.startTime).toLocaleTimeString()}
            {session.endTime ? ` - ${new Date(session.endTime).toLocaleTimeString()}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{session.venue?.name ?? "TBA"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Monitor className="h-4 w-4 text-gray-400" />
          <Badge variant={session.modeOfTeaching === "ONLINE" ? "info" : "purple"}>
            {session.modeOfTeaching}
          </Badge>
        </div>
        {session.topic && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-gray-500">Topic</p>
            <p className="text-sm text-gray-900">{session.topic}</p>
          </div>
        )}
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-500">Started by</p>
          <p className="text-sm text-gray-900">{session.starter?.firstName} {session.starter?.lastName}</p>
        </div>
      </CardContent>
    </Card>
  );
}
