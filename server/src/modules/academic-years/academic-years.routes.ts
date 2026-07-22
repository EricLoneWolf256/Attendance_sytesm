import { Router } from "express";
import { AcademicYearsController } from "./academic-years.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createAcademicYearSchema, updateAcademicYearSchema } from "./academic-years.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN"] as const;
const manageRoles = ["SUPER_ADMIN"] as const;

/**
 * @openapi
 * /api/academic-years:
 *   get:
 *     tags: [Academic Years]
 *     summary: List all academic years
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by label or code
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [label, code, startDate, endDate, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: isCurrent
 *         schema:
 *           type: boolean
 *         description: Filter by current status
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authorize(...adminRoles),
  AcademicYearsController.list
);

/**
 * @openapi
 * /api/academic-years/{id}:
 *   get:
 *     tags: [Academic Years]
 *     summary: Get academic year by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Academic year retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Academic year not found
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  AcademicYearsController.getById
);

/**
 * @openapi
 * /api/academic-years:
 *   post:
 *     tags: [Academic Years]
 *     summary: Create a new academic year
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, startDate, endDate]
 *             properties:
 *               label:
 *                 type: string
 *                 minLength: 2
 *                 description: Academic year label (e.g. "2024/2025")
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date (ISO 8601)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date (must be after start date)
 *               isCurrent:
 *                 type: boolean
 *                 description: Whether this is the current academic year
 *     responses:
 *       201:
 *         description: Academic year created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createAcademicYearSchema),
  AcademicYearsController.create
);

/**
 * @openapi
 * /api/academic-years/{id}:
 *   patch:
 *     tags: [Academic Years]
 *     summary: Update an academic year
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               label:
 *                 type: string
 *                 minLength: 2
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isCurrent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Academic year updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Academic year not found
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateAcademicYearSchema),
  AcademicYearsController.update
);

/**
 * @openapi
 * /api/academic-years/{id}:
 *   delete:
 *     tags: [Academic Years]
 *     summary: Soft delete an academic year
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Academic year deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Academic year not found
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  AcademicYearsController.delete
);

export default router;
