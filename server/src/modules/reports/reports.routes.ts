import { Router } from "express";
import { ReportsController } from "./reports.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER"] as const;

/**
 * @openapi
 * /api/reports/student-attendance:
 *   get:
 *     tags: [Reports]
 *     summary: Get student attendance report
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: courseOfferingId
 *         schema: { type: string }
 *       - in: query
 *         name: semesterId
 *         schema: { type: string }
 *       - in: query
 *         name: academicYearId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student attendance report retrieved successfully
 */
router.get(
  "/student-attendance",
  authorize(...adminRoles),
  ReportsController.getStudentAttendance
);

/**
 * @openapi
 * /api/reports/course-attendance:
 *   get:
 *     tags: [Reports]
 *     summary: Get course attendance report
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: courseOfferingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course attendance report retrieved successfully
 */
router.get(
  "/course-attendance",
  authorize(...adminRoles),
  ReportsController.getCourseAttendance
);

/**
 * @openapi
 * /api/reports/session-attendance:
 *   get:
 *     tags: [Reports]
 *     summary: Get session attendance report
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session attendance report retrieved successfully
 */
router.get(
  "/session-attendance",
  authorize(...adminRoles),
  ReportsController.getSessionAttendance
);

/**
 * @openapi
 * /api/reports/faculty-overview:
 *   get:
 *     tags: [Reports]
 *     summary: Get faculty overview report
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: facultyId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: academicYearId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Faculty overview report retrieved successfully
 */
router.get(
  "/faculty-overview",
  authorize(...adminRoles),
  ReportsController.getFacultyOverview
);

/**
 * @openapi
 * /api/reports/department-overview:
 *   get:
 *     tags: [Reports]
 *     summary: Get department overview report
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: academicYearId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Department overview report retrieved successfully
 */
router.get(
  "/department-overview",
  authorize(...adminRoles),
  ReportsController.getDepartmentOverview
);

/**
 * @openapi
 * /api/reports/attendance-trend:
 *   get:
 *     tags: [Reports]
 *     summary: Get attendance trend report
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: courseOfferingId
 *         schema: { type: string }
 *       - in: query
 *         name: programmeId
 *         schema: { type: string }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Attendance trend report retrieved successfully
 */
router.get(
  "/attendance-trend",
  authorize(...adminRoles),
  ReportsController.getAttendanceTrend
);

export default router;
