import api from "../api";

export const attendanceService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/attendance", { params });
  },
  async getById(id: string) {
    return api.get(`/attendance/${id}`);
  },
  async markAttendance(data: { sessionId: string; studentId: string; status?: string; signInMethod?: string }) {
    return api.post("/attendance", data);
  },
  async bulkMarkAttendance(data: { sessionId: string; records: { studentId: string; status?: string }[]; signInMethod?: string }) {
    return api.post("/attendance/bulk", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/attendance/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/attendance/${id}`);
  },
  async getSessionStats(sessionId: string) {
    return api.get(`/attendance/session/${sessionId}/stats`);
  },
};

export const enrollmentService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/enrollments", { params });
  },
  async getById(id: string) {
    return api.get(`/enrollments/${id}`);
  },
  async create(data: { studentId: string; courseOfferingId: string; classGroupId?: string | null }) {
    return api.post("/enrollments", data);
  },
  async bulkCreate(data: { studentIds: string[]; courseOfferingId: string }) {
    return api.post("/enrollments/bulk", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/enrollments/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/enrollments/${id}`);
  },
};
