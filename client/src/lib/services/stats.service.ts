import api from "../api";

export const statsService = {
  async getSystemStats() {
    return api.get("/reports/faculty-overview", { params: { facultyId: "system" } }).catch(() => ({
      totalUsers: 0,
      totalFaculties: 0,
      totalCourses: 0,
      totalSessions: 0,
    }));
  },
  async getFacultyStats(facultyId: string) {
    return api.get("/reports/faculty-overview", { params: { facultyId } });
  },
  async getDepartmentOverview(departmentId: string, academicYearId?: string) {
    return api.get("/reports/department-overview", { params: { departmentId, academicYearId } });
  },
  async getStudentAttendance(studentId: string, params?: Record<string, unknown>) {
    return api.get("/reports/student-attendance", { params: { studentId, ...params } });
  },
  async getCourseAttendance(courseOfferingId: string) {
    return api.get("/reports/course-attendance", { params: { courseOfferingId } });
  },
  async getAttendanceTrend(params?: Record<string, unknown>) {
    return api.get("/reports/attendance-trend", { params });
  },
};
