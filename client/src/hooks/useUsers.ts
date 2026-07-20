import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "LECTURER" | "STUDENT";
  regNumber: string | null;
  staffNumber: string | null;
  gender: string | null;
  status: string;
  campusId: string;
  facultyId: string | null;
  programmeId: string | null;
  yearOfStudy: number | null;
  createdAt: string;
  campus?: { id: string; name: string };
  faculty?: { id: string; name: string };
  programme?: { id: string; name: string };
}

export function useUsers(filters?: { role?: string }) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.role) params.set("role", filters.role);
      const qs = params.toString();
      const { data } = await api.get<{ users: UserRecord[] }>(`/users${qs ? `?${qs}` : ""}`);
      return data.users;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      regNumber?: string;
      staffNumber?: string;
      gender?: string;
      campusId: string;
      facultyId?: string;
      programmeId?: string;
      yearOfStudy?: number;
    }) => {
      const { data } = await api.post<{ user: UserRecord }>("/users", payload);
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      email?: string;
      role?: string;
      regNumber?: string;
      staffNumber?: string;
      gender?: string;
      status?: string;
      campusId?: string;
      facultyId?: string;
      programmeId?: string;
      yearOfStudy?: number;
    }) => {
      const { data } = await api.put<{ user: UserRecord }>(`/users/${id}`, payload);
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<{ user: UserRecord }>(`/users/${id}/deactivate`);
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
