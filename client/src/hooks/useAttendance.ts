import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: "present" | "absent" | "late" | "excused";
  signedInAt: string | null;
  signInMethod: "self" | "admin_override";
  createdAt: string;
  student: {
    id: string;
    name: string;
    regNumber: string | null;
    gender: string | null;
  };
}

export interface SessionAttendance {
  sessionId: string;
  session: {
    id: string;
    date: string;
    modeOfTeaching: "online" | "physical";
    startTime: string;
    venue: string | null;
    topic: string | null;
    status: "open" | "closed";
    course: { code: string; title: string };
  };
  records: AttendanceRecord[];
  totalEnrolled: number;
  totalPresent: number;
}

export function useSessionAttendance(sessionId: string) {
  return useQuery({
    queryKey: ["sessionAttendance", sessionId],
    queryFn: async () => {
      const { data } = await api.get<{ attendance: SessionAttendance }>(
        `/classrep/sessions/${sessionId}/attendance`
      );
      return data.attendance;
    },
    enabled: !!sessionId,
  });
}

export function useClassRepSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sessionId: string; studentId: string; status?: string }) => {
      const { data } = await api.post<{ record: AttendanceRecord }>(
        `/classrep/sessions/${payload.sessionId}/sign-in`,
        { studentId: payload.studentId, status: payload.status }
      );
      return data.record;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessionAttendance", variables.sessionId] });
    },
  });
}

export function useCorrectAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { recordId: string; sessionId: string; status: string }) => {
      const { data } = await api.put<{ record: AttendanceRecord }>(
        `/classrep/attendance/${payload.recordId}`,
        { status: payload.status }
      );
      return data.record;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessionAttendance", variables.sessionId] });
    },
  });
}
