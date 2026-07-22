import api from "../api";

export const programmeService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/programmes", { params });
  },
  async getById(id: string) {
    return api.get(`/programmes/${id}`);
  },
  async create(data: { name: string; code: string; departmentId: string; level?: string; durationYears?: number }) {
    return api.post("/programmes", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/programmes/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/programmes/${id}`);
  },
};
