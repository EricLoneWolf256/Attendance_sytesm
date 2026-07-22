import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { config } from "./index";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "UMU Attendance System API",
      version: "1.0.0",
      description:
        "Backend API for the University of Management Sciences (UMU) Attendance Management System. " +
        "Provides authentication, user management, academic structure, course offerings, enrollment, " +
        "class sessions, attendance tracking, and reporting capabilities.",
      contact: { name: "UMU Development Team" },
      license: { name: "MIT" },
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: "Development" },
      { url: "https://api.attendance.example.com", description: "Production" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "JWT access token set via HTTP-only cookie (set after login)",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            details: { type: "array", items: { type: "object" } },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        UserRole: {
          type: "string",
          enum: ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"],
        },
        UserStatus: {
          type: "string",
          enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"],
        },
        ProgrammeLevel: {
          type: "string",
          enum: ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"],
        },
        CourseOfferingStatus: {
          type: "string",
          enum: ["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"],
        },
        SessionMode: {
          type: "string",
          enum: ["ONLINE", "PHYSICAL", "HYBRID"],
        },
        SessionStatus: {
          type: "string",
          enum: ["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"],
        },
        AttendanceStatus: {
          type: "string",
          enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
        },
        SignInMethod: {
          type: "string",
          enum: ["QR", "PIN", "SELF", "ADMIN_OVERRIDE"],
        },
        EnrollmentStatus: {
          type: "string",
          enum: ["ENROLLED", "DROPPED", "COMPLETED", "WITHDRAWN"],
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "UMU Attendance API Docs",
  }));
  app.get("/api/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
