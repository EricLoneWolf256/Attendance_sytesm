import api from "../api";

export const userService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/users", { params });
  },
  async getById(id: string) {
    return api.get(`/users/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post("/users", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/users/${id}`, data);
  },
  async updateStatus(id: string, status: string) {
    return api.patch(`/users/${id}/status`, { status });
  },
  async updateRole(id: string, role: string) {
    return api.patch(`/users/${id}/role`, { role });
  },
  async delete(id: string) {
    return api.delete(`/users/${id}`);
  },
};
