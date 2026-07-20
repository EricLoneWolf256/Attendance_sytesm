import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  regNumber: string | null;
  gender: string | null;
  campusId: string;
  facultyId: string | null;
  programmeId: string | null;
  yearOfStudy: number | null;
  campus?: { id: string; name: string };
  faculty?: { id: string; name: string };
  programme?: { id: string; name: string };
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  enrolledAt: string;
  courseOffering: {
    id: string;
    courseId: string;
    programmeId: string;
    yearOfStudy: number;
    semesterId: string;
    lecturerId: string;
    course: { id: string; code: string; title: string; creditUnits: number };
    programme: { id: string; name: string };
    semester: { id: string; name: string };
    lecturer: { id: string; name: string };
  };
}

export interface AvailableCourse {
  id: string;
  courseId: string;
  programmeId: string;
  yearOfStudy: number;
  semesterId: string;
  lecturerId: string;
  course: { id: string; code: string; title: string; creditUnits: number };
  programme: { id: string; name: string };
  semester: { id: string; name: string };
  lecturer: { id: string; name: string };
}

export interface CourseAttendance {
  courseOfferingId: string;
  course: { code: string; title: string };
  totalSessions: number;
  attended: number;
  percentage: number;
}

export interface AttendanceSummary {
  courses: CourseAttendance[];
  overallPercentage: number;
}

export interface OpenSession {
  id: string;
  courseOfferingId: string;
  date: string;
  modeOfTeaching: "online" | "physical";
  startTime: string;
  venue: string | null;
  topic: string | null;
  status: "open" | "closed";
  course: { code: string; title: string };
}

export function useStudentProfile() {
  return useQuery({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const { data } = await api.get<{ student: StudentProfile }>("/students/profile");
      return data.student;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      regNumber?: string;
      campusId?: string;
      facultyId?: string;
      programmeId?: string;
      yearOfStudy?: number;
      gender?: string;
    }) => {
      const { data } = await api.put<{ student: StudentProfile }>("/students/profile", payload);
      return data.student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
    },
  });
}

export function useStudentEnrollments() {
  return useQuery({
    queryKey: ["studentEnrollments"],
    queryFn: async () => {
      const { data } = await api.get<{ enrollments: StudentEnrollment[] }>("/students/enrollments");
      return data.enrollments;
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { courseOfferingId: string }) => {
      const { data } = await api.post<{ enrollment: StudentEnrollment }>("/students/enrollments", payload);
      return data.enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["availableCourses"] });
    },
  });
}

export function useUnenrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      await api.delete(`/students/enrollments/${enrollmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["availableCourses"] });
    },
  });
}

export function useAvailableCourses(filters?: { programmeId?: string; yearOfStudy?: number }) {
  return useQuery({
    queryKey: ["availableCourses", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.programmeId) params.set("programmeId", filters.programmeId);
      if (filters?.yearOfStudy) params.set("yearOfStudy", String(filters.yearOfStudy));
      const qs = params.toString();
      const { data } = await api.get<{ courses: AvailableCourse[] }>(
        `/students/available-courses${qs ? `?${qs}` : ""}`
      );
      return data.courses;
    },
  });
}

export function useAttendanceSummary() {
  return useQuery({
    queryKey: ["attendanceSummary"],
    queryFn: async () => {
      const { data } = await api.get<{ summary: AttendanceSummary }>("/students/attendance");
      return data.summary;
    },
  });
}

export function useOpenSessions() {
  return useQuery({
    queryKey: ["openSessions"],
    queryFn: async () => {
      const { data } = await api.get<{ sessions: OpenSession[] }>("/students/sessions/open");
      return data.sessions;
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post<{ message: string }>(`/students/sessions/${sessionId}/sign-in`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openSessions"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceSummary"] });
    },
  });
}
