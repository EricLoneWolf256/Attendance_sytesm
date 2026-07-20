import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Faculty {
  id: string;
  name: string;
  campusId: string;
  createdAt: string;
  campus?: { id: string; name: string };
}

export function useFaculties() {
  return useQuery({
    queryKey: ["faculties"],
    queryFn: async () => {
      const { data } = await api.get<{ faculties: Faculty[] }>("/faculties");
      return data.faculties;
    },
  });
}

export function useCreateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; campusId: string }) => {
      const { data } = await api.post<{ faculty: Faculty }>("/faculties", payload);
      return data.faculty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; campusId: string }) => {
      const { data } = await api.put<{ faculty: Faculty }>(`/faculties/${id}`, payload);
      return data.faculty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/faculties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}
