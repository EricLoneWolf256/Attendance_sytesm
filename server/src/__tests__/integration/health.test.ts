import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

describe("GET /api/health", () => {
  it("should return 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });

  it("should return a valid ISO timestamp", async () => {
    const res = await request(app).get("/api/health");
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it("should return JSON content type", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});
