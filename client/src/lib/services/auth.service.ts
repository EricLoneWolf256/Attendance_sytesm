import api from "../api";

export const authService = {
  async login(email: string, password: string) {
    return api.post("/auth/login", { email, password });
  },
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    campusId: string;
    gender?: string;
  }) {
    return api.post("/auth/register", data);
  },
  async logout() {
    return api.post("/auth/logout");
  },
  async getMe() {
    return api.get("/auth/me");
  },
  async refresh() {
    return api.post("/auth/refresh");
  },
};
