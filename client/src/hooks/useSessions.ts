import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface ClassSession {
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

export interface ClassRepStatus {
  id: string;
  studentId: string;
  programmeId: string;
  yearOfStudy: number;
  semesterId: string;
  programme: { id: string; name: string };
  semester: { id: string; name: string };
}

export function useClassRepStatus() {
  return useQuery({
    queryKey: ["classRepStatus"],
    queryFn: async () => {
      const { data } = await api.get<{ classRep: ClassRepStatus | null }>("/classrep/status");
      return data.classRep;
    },
  });
}

export function useSessions(filters?: { courseOfferingId?: string; status?: string }) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.courseOfferingId) params.set("courseOfferingId", filters.courseOfferingId);
      if (filters?.status) params.set("status", filters.status);
      const qs = params.toString();
      const { data } = await api.get<{ sessions: ClassSession[] }>(
        `/classrep/sessions${qs ? `?${qs}` : ""}`
      );
      return data.sessions;
    },
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const { data } = await api.get<{ session: ClassSession }>(`/classrep/sessions/${id}`);
      return data.session;
    },
    enabled: !!id,
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      courseOfferingId: string;
      date: string;
      modeOfTeaching: "online" | "physical";
      startTime: string;
      venue?: string;
      topic?: string;
    }) => {
      const { data } = await api.post<{ session: ClassSession }>("/classrep/sessions", payload);
      return data.session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useCloseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.put<{ session: ClassSession }>(`/classrep/sessions/${sessionId}/close`);
      return data.session;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", variables] });
    },
  });
}

export function useConfirmSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.put<{ session: ClassSession }>(`/classrep/sessions/${sessionId}/confirm`);
      return data.session;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", variables] });
    },
  });
}
