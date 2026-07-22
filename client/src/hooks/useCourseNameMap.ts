import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseService, courseOfferingService } from "@/lib/services/course.service";
import { queryKeys } from "@/lib/queryKeys";

export function useCourseNameMap(offeringIds: string[]) {
  const { data: allCourses = [] } = useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: () => courseService.getAll() as any,
  });

  const { data: offerings = [] } = useQuery({
    queryKey: queryKeys.courses.offerings,
    queryFn: () => courseOfferingService.getAll() as any,
  });

  return useMemo(() => {
    const map: Record<string, string> = {};
    for (const co of offerings) {
      if (!offeringIds.includes(co.id)) continue;
      const course = allCourses.find((c: any) => c.id === co.courseId);
      map[co.id] = course ? `${course.code} - ${course.title}` : co.id;
    }
    return map;
  }, [offerings, allCourses, offeringIds]);
}
