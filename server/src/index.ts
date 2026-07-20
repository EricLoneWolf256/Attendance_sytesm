import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import campusRoutes from "./routes/campuses";
import facultyRoutes from "./routes/faculties";
import departmentRoutes from "./routes/departments";
import programmeRoutes from "./routes/programmes";
import courseRoutes from "./routes/courses";
import courseOfferingRoutes from "./routes/course-offerings";
import enrollmentRoutes from "./routes/enrollments";
import classRepRoutes from "./routes/class-reps";
import academicRoutes from "./routes/academic";
import studentRoutes from "./routes/students";
import sessionRoutes from "./routes/sessions";
import attendanceRoutes from "./routes/attendance";
import reportRoutes from "./routes/reports";
import importRoutes from "./routes/import";
import auditRoutes from "./routes/audit";
import policyRoutes from "./routes/policies";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
  },
});

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campuses", campusRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/course-offerings", courseOfferingRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/class-reps", classRepRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/import", importRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/policies", policyRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-session", (sessionId: string) => {
    socket.join(`session:${sessionId}`);
  });

  socket.on("leave-session", (sessionId: string) => {
    socket.leave(`session:${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(errorHandler);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
