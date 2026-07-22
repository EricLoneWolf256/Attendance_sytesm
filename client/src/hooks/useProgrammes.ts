import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Programme } from "@/types";
import { programmeService } from "@/lib/services/programme.service";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export function useProgrammes(departmentId?: string) {
  const queryClient = useQueryClient();

  const {
    data: programmes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: departmentId
      ? queryKeys.programmes.byDepartment(departmentId)
      : queryKeys.programmes.all,
    queryFn: () =>
      departmentId
        ? programmeService.getAll({ departmentId }) as any
        : programmeService.getAll() as any,
  });

  const createProgramme = useMutation({
    mutationFn: (data: {
      name: string;
      departmentId: string;
      level: string;
    }) => {
      if (!data.name.trim()) throw new Error("Name is required");
      return programmeService.create({
        name: data.name,
        code: data.name.substring(0, 3).toUpperCase(),
        departmentId: data.departmentId,
        level: data.level,
      }) as any;
    },
    onSuccess: (newProg: Programme) => {
      queryClient.setQueryData<Programme[]>(
        queryKeys.programmes.all,
        (old = []) => [...old, newProg]
      );
      toast.success(`${newProg.name} created successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateProgramme = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Programme> }) => {
      if (!data.name?.trim()) throw new Error("Name is required");
      return programmeService.update(id, data as Record<string, unknown>) as any;
    },
    onSuccess: (updated: Programme) => {
      queryClient.setQueryData<Programme[]>(
        queryKeys.programmes.all,
        (old = []) => old.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success(`${updated.name} updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteProgramme = useMutation({
    mutationFn: (id: string) => programmeService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all });
      toast.success("Programme deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    programmes,
    isLoading,
    isError,
    createProgramme,
    updateProgramme,
    deleteProgramme,
  };
}
