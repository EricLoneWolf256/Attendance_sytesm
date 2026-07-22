import { Router } from "express";
import { ClassSessionsController } from "./class-sessions.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createClassSessionSchema, updateClassSessionSchema } from "./class-sessions.validation";

const router = Router();

router.use(authenticate);

const viewRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN", "LECTURER"] as const;

/**
 * @openapi
 * /api/class-sessions:
 *   get:
 *     tags: [Class Sessions]
 *     summary: List all class sessions
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
 *         name: courseOfferingId
 *         schema: { type: string }
 *       - in: query
 *         name: semesterId
 *         schema: { type: string }
 *       - in: query
 *         name: venueId
 *         schema: { type: string }
 *       - in: query
 *         name: startedBy
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: modeOfTeaching
 *         schema: { type: string, enum: [ONLINE, PHYSICAL, HYBRID] }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Class sessions retrieved successfully
 */
router.get(
  "/",
  authorize(...viewRoles),
  ClassSessionsController.list
);

/**
 * @openapi
 * /api/class-sessions/{id}:
 *   get:
 *     tags: [Class Sessions]
 *     summary: Get a class session by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Class session retrieved successfully
 */
router.get(
  "/:id",
  authorize(...viewRoles),
  ClassSessionsController.getById
);

/**
 * @openapi
 * /api/class-sessions:
 *   post:
 *     tags: [Class Sessions]
 *     summary: Create a new class session
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseOfferingId, date, startTime]
 *             properties:
 *               courseOfferingId:
 *                 type: string
 *               semesterId:
 *                 type: string
 *               venueId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               modeOfTeaching:
 *                 type: string
 *                 enum: [ONLINE, PHYSICAL, HYBRID]
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               topic:
 *                 type: string
 *               materials:
 *                 type: string
 *               maxCheckInTime:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Class session created successfully
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createClassSessionSchema),
  ClassSessionsController.create
);

/**
 * @openapi
 * /api/class-sessions/{id}:
 *   patch:
 *     tags: [Class Sessions]
 *     summary: Update a class session
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
 *               courseOfferingId:
 *                 type: string
 *               semesterId:
 *                 type: string
 *               venueId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               modeOfTeaching:
 *                 type: string
 *                 enum: [ONLINE, PHYSICAL, HYBRID]
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               topic:
 *                 type: string
 *               materials:
 *                 type: string
 *               maxCheckInTime:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class session updated successfully
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateClassSessionSchema),
  ClassSessionsController.update
);

/**
 * @openapi
 * /api/class-sessions/{id}/start:
 *   patch:
 *     tags: [Class Sessions]
 *     summary: Start a class session (SCHEDULED -> OPEN)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Class session started successfully
 */
router.patch(
  "/:id/start",
  authorize(...manageRoles),
  ClassSessionsController.startSession
);

/**
 * @openapi
 * /api/class-sessions/{id}/close:
 *   patch:
 *     tags: [Class Sessions]
 *     summary: Close a class session (OPEN -> CLOSED)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Class session closed successfully
 */
router.patch(
  "/:id/close",
  authorize(...manageRoles),
  ClassSessionsController.closeSession
);

/**
 * @openapi
 * /api/class-sessions/{id}/cancel:
 *   patch:
 *     tags: [Class Sessions]
 *     summary: Cancel a class session
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Class session cancelled successfully
 */
router.patch(
  "/:id/cancel",
  authorize(...manageRoles),
  ClassSessionsController.cancelSession
);

/**
 * @openapi
 * /api/class-sessions/{id}:
 *   delete:
 *     tags: [Class Sessions]
 *     summary: Delete a class session
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Class session deleted successfully
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  ClassSessionsController.delete
);

export default router;
