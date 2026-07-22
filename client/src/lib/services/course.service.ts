import api from "../api";

export const courseService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/courses", { params });
  },
  async getById(id: string) {
    return api.get(`/courses/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post("/courses", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/courses/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/courses/${id}`);
  },
};

export const courseOfferingService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get("/course-offerings", { params });
  },
  async getById(id: string) {
    return api.get(`/course-offerings/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post("/course-offerings", data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/course-offerings/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/course-offerings/${id}`);
  },
};
