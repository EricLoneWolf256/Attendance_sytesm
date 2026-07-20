import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Enrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  enrolledAt: string;
  student?: { id: string; name: string; email: string; regNumber: string | null };
  courseOffering?: {
    id: string;
    course?: { id: string; code: string; title: string };
    programme?: { id: string; name: string };
    semester?: { id: string; name: string };
  };
}

export function useEnrollments(filters?: { studentId?: string; courseOfferingId?: string }) {
  return useQuery({
    queryKey: ["enrollments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.studentId) params.set("studentId", filters.studentId);
      if (filters?.courseOfferingId) params.set("courseOfferingId", filters.courseOfferingId);
      const qs = params.toString();
      const { data } = await api.get<{ enrollments: Enrollment[] }>(
        `/enrollments${qs ? `?${qs}` : ""}`
      );
      return data.enrollments;
    },
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { studentId: string; courseOfferingId: string }) => {
      const { data } = await api.post<{ enrollment: Enrollment }>("/enrollments", payload);
      return data.enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useBulkEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { courseOfferingId: string; studentIds: string[] }) => {
      const { data } = await api.post<{ message: string; skipped: number }>(
        "/enrollments/bulk",
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/enrollments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
