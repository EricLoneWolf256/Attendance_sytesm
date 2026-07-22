import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, ClassSession } from "@/types";
import { sessionService } from "@/lib/services/session.service";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export interface SessionFormData {
  courseOfferingId: string;
  date: string;
  startTime: string;
  modeOfTeaching: string;
  venueId?: string;
  topic?: string;
}

export function useSessions(userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = userId
    ? queryKeys.sessions.lecturer(userId)
    : queryKeys.sessions.all;

  const { data: sessions = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      userId
        ? sessionService.getAll({ lecturerId: userId }) as any
        : sessionService.getAll() as any,
  });

  const openSessions = useMemo(
    () => sessions.filter((s: any) => s.status === "OPEN"),
    [sessions]
  );

  const startSession = useMutation({
    mutationFn: ({
      formData,
      user,
    }: {
      formData: SessionFormData;
      user: User | null;
    }) =>
      sessionService.create({
        ...formData,
        lecturerId: user?.id,
      }) as any,
    onSuccess: (newSession: ClassSession) => {
      queryClient.setQueryData<ClassSession[]>(queryKey, (old = []) => [
        newSession,
        ...old,
      ]);
      toast.success("Session started!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const stopSession = useMutation({
    mutationFn: (sessionId: string) => sessionService.closeSession(sessionId) as any,
    onSuccess: (_data: any, sessionId: string) => {
      queryClient.setQueryData<ClassSession[]>(queryKey, (old = []) =>
        old.map((s) =>
          s.id === sessionId
            ? { ...s, status: "CLOSED" as const, endTime: new Date() }
            : s
        )
      );
      toast.success("Session stopped");
    },
  });

  return {
    sessions,
    isLoading,
    openSessions,
    startSession,
    stopSession,
  };
}

export function useSessionForm() {
  const [formData, setFormData] = useState<SessionFormData>({
    courseOfferingId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    modeOfTeaching: "PHYSICAL",
    venueId: "",
    topic: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const updateField = <K extends keyof SessionFormData>(
    field: K,
    value: SessionFormData[K]
  ) => {
    setFormData((prev: SessionFormData) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      courseOfferingId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      modeOfTeaching: "PHYSICAL",
      venueId: "",
      topic: "",
    });
  };

  const openDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return {
    formData,
    setFormData,
    dialogOpen,
    setDialogOpen,
    updateField,
    resetForm,
    openDialog,
    closeDialog,
  };
}
