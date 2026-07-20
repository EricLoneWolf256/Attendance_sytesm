import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Programme {
  id: string;
  name: string;
  departmentId: string;
  level: "undergraduate" | "postgraduate" | "diploma";
  createdAt: string;
  department?: { id: string; name: string; facultyId: string };
}

export function useProgrammes() {
  return useQuery({
    queryKey: ["programmes"],
    queryFn: async () => {
      const { data } = await api.get<{ programmes: Programme[] }>("/programmes");
      return data.programmes;
    },
  });
}

export function useCreateProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; departmentId: string; level: string }) => {
      const { data } = await api.post<{ programme: Programme }>("/programmes", payload);
      return data.programme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
    },
  });
}

export function useUpdateProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; departmentId: string; level: string }) => {
      const { data } = await api.put<{ programme: Programme }>(`/programmes/${id}`, payload);
      return data.programme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
    },
  });
}

export function useDeleteProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/programmes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
    },
  });
}
