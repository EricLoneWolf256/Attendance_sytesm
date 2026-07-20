import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Campus {
  id: string;
  name: string;
  createdAt: string;
}

export function useCampuses() {
  return useQuery({
    queryKey: ["campuses"],
    queryFn: async () => {
      const { data } = await api.get<{ campuses: Campus[] }>("/campuses");
      return data.campuses;
    },
  });
}

export function useCreateCampus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await api.post<{ campus: Campus }>("/campuses", payload);
      return data.campus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
    },
  });
}

export function useUpdateCampus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string }) => {
      const { data } = await api.put<{ campus: Campus }>(`/campuses/${id}`, payload);
      return data.campus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
    },
  });
}

export function useDeleteCampus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/campuses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
    },
  });
}
