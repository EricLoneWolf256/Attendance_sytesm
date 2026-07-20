import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface ClassRep {
  id: string;
  studentId: string;
  programmeId: string;
  yearOfStudy: number;
  semesterId: string;
  assignedBy: string;
  assignedAt: string;
  student?: { id: string; name: string; email: string; regNumber: string | null };
  programme?: { id: string; name: string; level: string };
  semester?: { id: string; name: string };
  assigner?: { id: string; name: string };
}

export function useClassReps() {
  return useQuery({
    queryKey: ["classReps"],
    queryFn: async () => {
      const { data } = await api.get<{ classReps: ClassRep[] }>("/class-reps");
      return data.classReps;
    },
  });
}

export function useAssignClassRep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      studentId: string;
      programmeId: string;
      yearOfStudy: number;
      semesterId: string;
    }) => {
      const { data } = await api.post<{ classRep: ClassRep }>("/class-reps", payload);
      return data.classRep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classReps"] });
    },
  });
}

export function useRemoveClassRep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/class-reps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classReps"] });
    },
  });
}
