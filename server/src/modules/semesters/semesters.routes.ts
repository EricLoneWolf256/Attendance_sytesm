import { Router } from "express";
import { SemestersController } from "./semesters.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createSemesterSchema, updateSemesterSchema } from "./semesters.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN"] as const;
const manageRoles = ["SUPER_ADMIN"] as const;

/**
 * @openapi
 * /api/semesters:
 *   get:
 *     tags: [Semesters]
 *     summary: List all semesters
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
 *         name: academicYearId
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Semesters retrieved successfully
 */
router.get(
  "/",
  authorize(...adminRoles),
  SemestersController.list
);

/**
 * @openapi
 * /api/semesters/{id}:
 *   get:
 *     tags: [Semesters]
 *     summary: Get a semester by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Semester retrieved successfully
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  SemestersController.getById
);

/**
 * @openapi
 * /api/semesters:
 *   post:
 *     tags: [Semesters]
 *     summary: Create a new semester
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [academicYearId, name, startDate, endDate]
 *             properties:
 *               academicYearId:
 *                 type: string
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               intakeMonth:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Semester created successfully
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createSemesterSchema),
  SemestersController.create
);

/**
 * @openapi
 * /api/semesters/{id}:
 *   patch:
 *     tags: [Semesters]
 *     summary: Update a semester
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
 *               academicYearId:
 *                 type: string
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               intakeMonth:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Semester updated successfully
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateSemesterSchema),
  SemestersController.update
);

/**
 * @openapi
 * /api/semesters/{id}:
 *   delete:
 *     tags: [Semesters]
 *     summary: Hard delete a semester
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Semester deleted successfully
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  SemestersController.delete
);

export default router;
