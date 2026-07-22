import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Faculty } from "@/types";
import { facultyService } from "@/lib/services/faculty.service";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export function useFaculties() {
  const queryClient = useQueryClient();

  const {
    data: faculties = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.faculties.all,
    queryFn: () => facultyService.getAll() as any,
  });

  const createFaculty = useMutation({
    mutationFn: (data: { name: string; campusId: string; code?: string }) => {
      if (!data.name.trim()) throw new Error("Name is required");
      return facultyService.create({
        name: data.name,
        code: data.code ?? data.name.substring(0, 3).toUpperCase(),
        campusId: data.campusId,
      }) as any;
    },
    onSuccess: (newFaculty: Faculty) => {
      queryClient.setQueryData<Faculty[]>(queryKeys.faculties.all, (old = []) => [
        ...old,
        newFaculty,
      ]);
      toast.success(`${newFaculty.name} created successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateFaculty = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Faculty> }) => {
      if (!data.name?.trim()) throw new Error("Name is required");
      return facultyService.update(id, data as Record<string, unknown>) as any;
    },
    onSuccess: (updated: Faculty) => {
      queryClient.setQueryData<Faculty[]>(queryKeys.faculties.all, (old = []) =>
        old.map((f) => (f.id === updated.id ? updated : f))
      );
      toast.success(`${updated.name} updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteFaculty = useMutation({
    mutationFn: (id: string) => facultyService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faculties.all });
      toast.success("Faculty deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    faculties,
    isLoading,
    isError,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  };
}
