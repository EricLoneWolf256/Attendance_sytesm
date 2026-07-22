import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Department } from "@/types";
import { departmentService } from "@/lib/services/department.service";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export function useDepartments(facultyId?: string) {
  const queryClient = useQueryClient();

  const {
    data: departments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: facultyId
      ? queryKeys.departments.byFaculty(facultyId)
      : queryKeys.departments.all,
    queryFn: () =>
      facultyId
        ? departmentService.getAll({ facultyId }) as any
        : departmentService.getAll() as any,
  });

  const createDepartment = useMutation({
    mutationFn: (data: { name: string; facultyId: string; code?: string }) => {
      if (!data.name.trim()) throw new Error("Name is required");
      return departmentService.create({
        name: data.name,
        code: data.code ?? data.name.substring(0, 3).toUpperCase(),
        facultyId: data.facultyId,
      }) as any;
    },
    onSuccess: (newDept: Department) => {
      queryClient.setQueryData<Department[]>(
        queryKeys.departments.all,
        (old = []) => [...old, newDept]
      );
      toast.success(`${newDept.name} created successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateDepartment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) => {
      if (!data.name?.trim()) throw new Error("Name is required");
      return departmentService.update(id, data as Record<string, unknown>) as any;
    },
    onSuccess: (updated: Department) => {
      queryClient.setQueryData<Department[]>(
        queryKeys.departments.all,
        (old = []) => old.map((d) => (d.id === updated.id ? updated : d))
      );
      toast.success(`${updated.name} updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: (id: string) => departmentService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast.success("Department deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    departments,
    isLoading,
    isError,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}
