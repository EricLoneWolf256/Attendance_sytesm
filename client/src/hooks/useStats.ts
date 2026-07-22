import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/lib/services/stats.service";
import { queryKeys } from "@/lib/queryKeys";

export function useSystemStats() {
  return useQuery({
    queryKey: queryKeys.stats.system,
    queryFn: () => statsService.getSystemStats() as any,
  });
}

export function useFacultyStats(facultyId?: string) {
  return useQuery({
    queryKey: queryKeys.stats.faculty(facultyId ?? ""),
    queryFn: () => statsService.getFacultyStats(facultyId ?? "") as any,
    enabled: !!facultyId,
  });
}
