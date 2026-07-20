import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface AcademicYear {
  id: string;
  label: string;
  isCurrent: boolean;
  createdAt: string;
  semesters?: Semester[];
}

export interface Semester {
  id: string;
  academicYearId: string;
  name: string;
  intakeMonth: string | null;
  isActive: boolean;
  createdAt: string;
  academicYear?: { id: string; label: string };
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academicYears"],
    queryFn: async () => {
      const { data } = await api.get<{ years: AcademicYear[] }>("/academic/years");
      return data.years;
    },
  });
}

export function useSemesters(filters?: { academicYearId?: string }) {
  return useQuery({
    queryKey: ["semesters", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.academicYearId) params.set("academicYearId", filters.academicYearId);
      const qs = params.toString();
      const { data } = await api.get<{ semesters: Semester[] }>(
        `/academic/semesters${qs ? `?${qs}` : ""}`
      );
      return data.semesters;
    },
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { label: string; isCurrent?: boolean }) => {
      const { data } = await api.post<{ year: AcademicYear }>("/academic/years", payload);
      return data.year;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; label?: string; isCurrent?: boolean }) => {
      const { data } = await api.put<{ year: AcademicYear }>(`/academic/years/${id}`, payload);
      return data.year;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
    },
  });
}

export function useCreateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      academicYearId: string;
      name: string;
      intakeMonth?: string;
      isActive?: boolean;
    }) => {
      const { data } = await api.post<{ semester: Semester }>("/academic/semesters", payload);
      return data.semester;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
    },
  });
}

export function useUpdateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; isActive?: boolean }) => {
      const { data } = await api.put<{ semester: Semester }>(
        `/academic/semesters/${id}`,
        payload
      );
      return data.semester;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
    },
  });
}
