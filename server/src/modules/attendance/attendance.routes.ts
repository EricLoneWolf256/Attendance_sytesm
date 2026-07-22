import { Router } from "express";
import { AttendanceController } from "./attendance.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { markAttendanceSchema, bulkMarkAttendanceSchema, updateAttendanceSchema } from "./attendance.validation";

const router = Router();

router.use(authenticate);

const viewRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN", "LECTURER"] as const;

/**
 * @openapi
 * /api/attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: List all attendance records
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: sessionId
 *         schema: { type: string }
 *       - in: query
 *         name: studentId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PRESENT, ABSENT, LATE, EXCUSED] }
 *       - in: query
 *         name: signInMethod
 *         schema: { type: string, enum: [QR, PIN, SELF, ADMIN_OVERRIDE] }
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 */
router.get(
  "/",
  authorize(...viewRoles),
  AttendanceController.list
);

/**
 * @openapi
 * /api/attendance/{id}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get an attendance record by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 */
router.get(
  "/:id",
  authorize(...viewRoles),
  AttendanceController.getById
);

/**
 * @openapi
 * /api/attendance/session/{sessionId}/stats:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance stats for a session
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session attendance stats retrieved successfully
 */
router.get(
  "/session/:sessionId/stats",
  authorize(...viewRoles),
  AttendanceController.getSessionStats
);

/**
 * @openapi
 * /api/attendance:
 *   post:
 *     tags: [Attendance]
 *     summary: Mark attendance for a student
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, studentId]
 *             properties:
 *               sessionId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *               signInMethod:
 *                 type: string
 *                 enum: [QR, PIN, SELF, ADMIN_OVERRIDE]
 *               deviceFingerprint:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(markAttendanceSchema),
  AttendanceController.markAttendance
);

/**
 * @openapi
 * /api/attendance/bulk:
 *   post:
 *     tags: [Attendance]
 *     summary: Bulk mark attendance
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, records]
 *             properties:
 *               sessionId:
 *                 type: string
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [studentId]
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *               signInMethod:
 *                 type: string
 *                 enum: [QR, PIN, SELF, ADMIN_OVERRIDE]
 *     responses:
 *       201:
 *         description: Bulk attendance marked successfully
 */
router.post(
  "/bulk",
  authorize(...manageRoles),
  validate(bulkMarkAttendanceSchema),
  AttendanceController.bulkMarkAttendance
);

/**
 * @openapi
 * /api/attendance/{id}:
 *   patch:
 *     tags: [Attendance]
 *     summary: Update an attendance record
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *               signInMethod:
 *                 type: string
 *                 enum: [QR, PIN, SELF, ADMIN_OVERRIDE]
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateAttendanceSchema),
  AttendanceController.update
);

/**
 * @openapi
 * /api/attendance/{id}:
 *   delete:
 *     tags: [Attendance]
 *     summary: Delete an attendance record
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  AttendanceController.delete
);

export default router;
