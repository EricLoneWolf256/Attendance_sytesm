import api from "../api";

export const sessionService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/class-sessions", { params });
  },
  async getById(id: string) {
    return api.get(`/class-sessions/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post("/class-sessions", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/class-sessions/${id}`, data);
  },
  async startSession(id: string) {
    return api.patch(`/class-sessions/${id}/start`);
  },
  async closeSession(id: string) {
    return api.patch(`/class-sessions/${id}/close`);
  },
  async cancelSession(id: string) {
    return api.patch(`/class-sessions/${id}/cancel`);
  },
  async delete(id: string) {
    return api.delete(`/class-sessions/${id}`);
  },
};
