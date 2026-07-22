import api from "../api";

export const facultyService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/faculties", { params });
  },
  async getById(id: string) {
    return api.get(`/faculties/${id}`);
  },
  async create(data: { name: string; code: string; campusId: string; deanId?: string | null }) {
    return api.post("/faculties", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/faculties/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/faculties/${id}`);
  },
};
