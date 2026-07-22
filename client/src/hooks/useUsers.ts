import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserRole } from "@/types";
import { userService } from "@/lib/services/user.service";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export function useUsers() {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => userService.getAll() as any,
  });

  const createUser = useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
      studentNumber?: string;
      staffNumber?: string;
      facultyId?: string | null;
    }) => {
      if (!data.firstName.trim() || !data.email.trim()) {
        throw new Error("First name and email are required");
      }
      return userService.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        studentNumber: data.role === "STUDENT" ? data.studentNumber : undefined,
        staffNumber: data.role !== "STUDENT" ? data.staffNumber : undefined,
        gender: "Other",
        campusId: "c1",
        facultyId: data.facultyId ?? null,
        programmeId: null,
        yearOfStudy: data.role === "STUDENT" ? 1 : null,
        status: "ACTIVE",
      }) as any;
    },
    onSuccess: (newUser: User) => {
      queryClient.setQueryData<User[]>(queryKeys.users.all, (old = []) => [
        ...old,
        newUser,
      ]);
      toast.success(`User "${newUser.firstName} ${newUser.lastName}" created successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateUser = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<User>;
    }) => userService.update(id, data as Record<string, unknown>) as any,
    onSuccess: (updated: User) => {
      queryClient.setQueryData<User[]>(queryKeys.users.all, (old = []) =>
        old.map((u: User) => (u.id === updated.id ? updated : u))
      );
      toast.success(`${updated.firstName} ${updated.lastName} updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({
      id,
      currentStatus,
    }: {
      id: string;
      currentStatus: string;
    }) => {
      const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      return userService.updateStatus(id, newStatus) as any;
    },
    onSuccess: (updated: User) => {
      queryClient.setQueryData<User[]>(queryKeys.users.all, (old = []) =>
        old.map((u: User) => (u.id === updated.id ? updated : u))
      );
      toast.success(
        `${updated.firstName} ${updated.lastName} ${updated.status === "ACTIVE" ? "activated" : "suspended"}`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const filteredUsers = useMemo(() => users, [users]);

  return {
    users: filteredUsers,
    isLoading,
    isError,
    createUser,
    updateUser,
    toggleStatus,
  };
}

export function useUserFaculties() {
  const { data: faculties = [] } = useQuery({
    queryKey: queryKeys.faculties.all,
    queryFn: () =>
      import("@/lib/services/faculty.service").then(
        (m) => m.facultyService.getAll() as any
      ),
  });
  return { faculties };
}
