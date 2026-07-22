import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course } from "@/types";
import { courseService, courseOfferingService } from "@/lib/services/course.service";
import { departmentService } from "@/lib/services/department.service";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export function useCourses(facultyId?: string) {
  const queryClient = useQueryClient();

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: facultyId
      ? queryKeys.courses.byFaculty(facultyId)
      : queryKeys.courses.all,
    queryFn: () =>
      facultyId
        ? courseService.getAll({ departmentId: facultyId }) as any
        : courseService.getAll() as any,
  });

  const createCourse = useMutation({
    mutationFn: (data: {
      code: string;
      title: string;
      creditUnits: number;
      departmentId: string;
    }) => {
      if (!data.code.trim() || !data.title.trim()) {
        throw new Error("Course code and title are required");
      }
      return courseService.create(data) as any;
    },
    onSuccess: (newCourse: Course) => {
      queryClient.setQueryData<Course[]>(
        facultyId
          ? queryKeys.courses.byFaculty(facultyId)
          : queryKeys.courses.all,
        (old = []) => [...old, newCourse]
      );
      toast.success(
        `Course "${newCourse.code} - ${newCourse.title}" created successfully`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateCourse = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) => {
      if (!data.code?.trim() || !data.title?.trim()) {
        throw new Error("Course code and title are required");
      }
      return courseService.update(id, data as Record<string, unknown>) as any;
    },
    onSuccess: (updated: Course) => {
      queryClient.setQueryData<Course[]>(
        facultyId
          ? queryKeys.courses.byFaculty(facultyId)
          : queryKeys.courses.all,
        (old = []) => old.map((c) => (c.id === updated.id ? updated : c))
      );
      toast.success(`Course "${updated.code}" updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteCourse = useMutation({
    mutationFn: (id: string) => courseService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Course deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    courses,
    isLoading,
    isError,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: () => departmentService.getAll() as any,
  });
}

export function useCourseOfferings(facultyId?: string) {
  return useQuery({
    queryKey: facultyId
      ? queryKeys.courses.byFaculty(facultyId)
      : queryKeys.courses.offerings,
    queryFn: () =>
      courseOfferingService.getAll(
        facultyId ? { departmentId: facultyId } : undefined
      ) as any,
  });
}

export function useCourseOfferingsByLecturer(lecturerId?: string) {
  return useQuery({
    queryKey: lecturerId
      ? queryKeys.courses.offeringsByLecturer(lecturerId)
      : queryKeys.courses.offerings,
    queryFn: () =>
      courseOfferingService.getAll(
        lecturerId ? { lecturerId } : undefined
      ) as any,
    enabled: !!lecturerId,
  });
}
