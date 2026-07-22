import { Router } from "express";
import { EnrollmentsController } from "./enrollments.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createEnrollmentSchema, bulkCreateEnrollmentSchema, updateEnrollmentSchema } from "./enrollments.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN", "DEPARTMENT_ADMIN", "LECTURER"] as const;

/**
 * @openapi
 * /api/enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: List all enrollments
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
 *         name: studentId
 *         schema: { type: string }
 *       - in: query
 *         name: classGroupId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ENROLLED, DROPPED, COMPLETED, WITHDRAWN] }
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 */
router.get(
  "/",
  authorize(...adminRoles),
  EnrollmentsController.list
);

/**
 * @openapi
 * /api/enrollments/{id}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get an enrollment by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Enrollment retrieved successfully
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  EnrollmentsController.getById
);

/**
 * @openapi
 * /api/enrollments:
 *   post:
 *     tags: [Enrollments]
 *     summary: Create a new enrollment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, courseOfferingId]
 *             properties:
 *               studentId:
 *                 type: string
 *               courseOfferingId:
 *                 type: string
 *               classGroupId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createEnrollmentSchema),
  EnrollmentsController.create
);

/**
 * @openapi
 * /api/enrollments/bulk:
 *   post:
 *     tags: [Enrollments]
 *     summary: Bulk create enrollments
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentIds, courseOfferingId]
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               courseOfferingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bulk enrollment completed
 */
router.post(
  "/bulk",
  authorize(...manageRoles),
  validate(bulkCreateEnrollmentSchema),
  EnrollmentsController.bulkCreate
);

/**
 * @openapi
 * /api/enrollments/{id}:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Update an enrollment
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
 *               classGroupId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ENROLLED, DROPPED, COMPLETED, WITHDRAWN]
 *     responses:
 *       200:
 *         description: Enrollment updated successfully
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateEnrollmentSchema),
  EnrollmentsController.update
);

/**
 * @openapi
 * /api/enrollments/{id}:
 *   delete:
 *     tags: [Enrollments]
 *     summary: Delete an enrollment
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Enrollment deleted successfully
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  EnrollmentsController.delete
);

export default router;
