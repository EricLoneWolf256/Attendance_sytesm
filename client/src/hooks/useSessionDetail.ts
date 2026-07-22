import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClassSession, AttendanceRecord } from "@/types";
import { sessionService } from "@/lib/services/session.service";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export function useSessionDetail(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.sessions.detail(sessionId ?? ""),
    queryFn: () => sessionService.getById(sessionId!) as any,
    enabled: !!sessionId,
  });

  const session = data?.session ?? data ?? null;
  const records = useMemo(() => data?.records ?? [], [data]);

  const signedInCount = useMemo(
    () => (session ? session.totalSignedIn + records.length : 0),
    [session, records]
  );

  const absentCount = useMemo(
    () => (session ? Math.max(0, session.totalEnrolled - signedInCount) : 0),
    [session, signedInCount]
  );

  const attendancePct = useMemo(
    () =>
      session && session.totalEnrolled > 0
        ? Math.round((signedInCount / session.totalEnrolled) * 100)
        : 0,
    [session, signedInCount]
  );

  const { data: isConfirmed = false } = useQuery({
    queryKey: ["sessions", "confirmed", sessionId],
    queryFn: () => false,
  });

  const stopSession = useMutation({
    mutationFn: () => sessionService.closeSession(sessionId!) as any,
    onSuccess: () => {
      if (session) {
        queryClient.setQueryData(
          queryKeys.sessions.detail(session.id),
          (old: { session: ClassSession | null; records: AttendanceRecord[] } | undefined) =>
            old
              ? {
                  ...old,
                  session: old.session
                    ? { ...old.session, status: "closed" as const, endTime: "now" }
                    : null,
                }
              : old
        );
      }
      toast.success("Session stopped");
    },
  });

  const confirmSession = useMutation({
    mutationFn: () => sessionService.closeSession(sessionId!) as any,
    onSuccess: () => {
      if (session) {
        queryClient.setQueryData(
          ["sessions", "confirmed", session.id],
          true
        );
      }
      toast.success("Session confirmed and signed off");
    },
  });

  return {
    session,
    records,
    signedInCount,
    absentCount,
    attendancePct,
    isConfirmed,
    isLoading,
    handleStopSession: stopSession.mutate,
    handleConfirmSession: confirmSession.mutate,
  };
}
