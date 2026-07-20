import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface PolicyRecord {
  id: string;
  programmeId: string | null;
  minPercentage: number;
  createdAt: string;
  updatedAt: string;
  programme: { id: string; name: string } | null;
}

export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const { data } = await api.get<{ policies: PolicyRecord[] }>("/policies");
      return data.policies;
    },
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { programmeId?: string; minPercentage: number }) => {
      const { data } = await api.post<{ policy: PolicyRecord }>("/policies", payload);
      return data.policy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/policies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}
