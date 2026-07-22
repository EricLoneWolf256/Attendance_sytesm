import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { setupSwagger } from "./config/swagger";
import { initializeSocket } from "./sockets";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import facultiesRoutes from "./modules/faculties/faculties.routes";
import departmentsRoutes from "./modules/departments/departments.routes";
import programmesRoutes from "./modules/programmes/programmes.routes";
import academicYearsRoutes from "./modules/academic-years/academic-years.routes";
import semestersRoutes from "./modules/semesters/semesters.routes";
import coursesRoutes from "./modules/courses/courses.routes";
import courseOfferingsRoutes from "./modules/course-offerings/course-offerings.routes";
import enrollmentsRoutes from "./modules/enrollments/enrollments.routes";
import classSessionsRoutes from "./modules/class-sessions/class-sessions.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import reportsRoutes from "./modules/reports/reports.routes";

const app = express();
const httpServer = createServer(app);

initializeSocket(httpServer);

app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests, please try again later" },
  })
);

setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/faculties", facultiesRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/programmes", programmesRoutes);
app.use("/api/academic-years", academicYearsRoutes);
app.use("/api/semesters", semestersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/course-offerings", courseOfferingsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/class-sessions", classSessionsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});
