import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface LecturerCourseOffering {
  id: string;
  course: { id: string; code: string; title: string };
  programme: { id: string; name: string };
  semester: { id: string; name: string };
  yearOfStudy: number;
  lecturer: { id: string; name: string; email: string };
  _count: { sessions: number; enrollments: number };
}

interface LecturerSession {
  id: string;
  courseOfferingId: string;
  startedBy: string;
  date: string;
  modeOfTeaching: "online" | "physical";
  startTime: string;
  endTime: string | null;
  duration: number | null;
  venue: string | null;
  topic: string | null;
  status: "open" | "closed";
  lecturerConfirmedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  courseOffering?: {
    id: string;
    course: { id: string; code: string; title: string };
    programme: { id: string; name: string };
    semester: { id: string; name: string };
  };
  starter?: { id: string; name: string };
  _count?: { attendanceRecords: number };
}

interface LecturerSessionDetail {
  id: string;
  courseOfferingId: string;
  startedBy: string;
  date: string;
  modeOfTeaching: "online" | "physical";
  startTime: string;
  endTime: string | null;
  duration: number | null;
  venue: string | null;
  topic: string | null;
  status: "open" | "closed";
  lecturerConfirmedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  courseOffering: {
    id: string;
    course: { id: string; code: string; title: string };
    programme: { id: string; name: string };
    semester: { id: string; name: string };
    lecturer: { id: string; name: string; email: string };
  };
  starter: { id: string; name: string; email: string } | null;
  attendanceRecords: {
    id: string;
    studentId: string;
    status: string;
    signedInAt: string | null;
    student: { id: string; name: string; email: string; regNumber: string | null; gender: string | null };
  }[];
  _count?: { attendanceRecords: number };
}

export function useLecturerOfferings() {
  return useQuery({
    queryKey: ["lecturerOfferings"],
    queryFn: async () => {
      const { data } = await api.get<{ sessions: LecturerSession[] }>("/sessions");
      const sessions = data.sessions || [];

      const offeringMap = new Map<string, LecturerCourseOffering>();
      for (const s of sessions) {
        if (!s.courseOffering) continue;
        const coId = s.courseOfferingId;
        if (!offeringMap.has(coId)) {
          offeringMap.set(coId, {
            id: s.courseOffering.id,
            course: s.courseOffering.course,
            programme: s.courseOffering.programme,
            semester: s.courseOffering.semester,
            yearOfStudy: 0,
            lecturer: { id: "", name: "", email: "" },
            _count: { sessions: 0, enrollments: 0 },
          });
        }
        const existing = offeringMap.get(coId)!;
        existing._count.sessions += 1;
      }

      return Array.from(offeringMap.values());
    },
  });
}

export function useLecturerSessions(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["lecturerSessions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      const qs = params.toString();
      const { data } = await api.get<{ sessions: LecturerSession[] }>(
        `/sessions${qs ? `?${qs}` : ""}`
      );
      return data.sessions;
    },
  });
}

export function useLecturerSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: ["lecturerSessionDetail", sessionId],
    queryFn: async () => {
      const { data } = await api.get<{ session: LecturerSessionDetail }>(
        `/sessions/${sessionId}`
      );
      return data.session;
    },
    enabled: !!sessionId,
  });
}

export function useConfirmSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.put<{ session: LecturerSession }>(
        `/sessions/${sessionId}/confirm`
      );
      return data.session;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lecturerSessions"] });
      queryClient.invalidateQueries({ queryKey: ["lecturerSessionDetail", variables] });
      queryClient.invalidateQueries({ queryKey: ["lecturerOfferings"] });
    },
  });
}
