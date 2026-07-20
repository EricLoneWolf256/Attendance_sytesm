import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface CourseOffering {
  id: string;
  courseId: string;
  programmeId: string;
  yearOfStudy: number;
  semesterId: string;
  lecturerId: string;
  createdAt: string;
  course?: { id: string; code: string; title: string };
  programme?: { id: string; name: string; level: string };
  semester?: { id: string; name: string; academicYearId: string };
  lecturer?: { id: string; name: string; email: string };
}

export function useCourseOfferings() {
  return useQuery({
    queryKey: ["courseOfferings"],
    queryFn: async () => {
      const { data } = await api.get<{ courseOfferings: CourseOffering[] }>("/course-offerings");
      return data.courseOfferings;
    },
  });
}

export function useCreateCourseOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      courseId: string;
      programmeId: string;
      yearOfStudy: number;
      semesterId: string;
      lecturerId: string;
    }) => {
      const { data } = await api.post<{ courseOffering: CourseOffering }>("/course-offerings", payload);
      return data.courseOffering;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
    },
  });
}

export function useUpdateCourseOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      courseId?: string;
      programmeId?: string;
      yearOfStudy?: number;
      semesterId?: string;
      lecturerId?: string;
    }) => {
      const { data } = await api.put<{ courseOffering: CourseOffering }>(
        `/course-offerings/${id}`,
        payload
      );
      return data.courseOffering;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
    },
  });
}

export function useDeleteCourseOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/course-offerings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
    },
  });
}
