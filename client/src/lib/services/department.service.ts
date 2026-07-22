import api from "../api";

export const departmentService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/departments", { params });
  },
  async getById(id: string) {
    return api.get(`/departments/${id}`);
  },
  async create(data: { name: string; code: string; facultyId: string; hodId?: string | null }) {
    return api.post("/departments", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/departments/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/departments/${id}`);
  },
};
