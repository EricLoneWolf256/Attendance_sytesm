import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Course {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  departmentId: string;
  createdAt: string;
  department?: { id: string; name: string };
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await api.get<{ courses: Course[] }>("/courses");
      return data.courses;
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; title: string; creditUnits: number; departmentId: string }) => {
      const { data } = await api.post<{ course: Course }>("/courses", payload);
      return data.course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; code: string; title: string; creditUnits: number; departmentId: string }) => {
      const { data } = await api.put<{ course: Course }>(`/courses/${id}`, payload);
      return data.course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
