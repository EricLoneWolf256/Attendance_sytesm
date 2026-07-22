import { Router } from "express";
import { ProgrammesController } from "./programmes.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createProgrammeSchema, updateProgrammeSchema } from "./programmes.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN"] as const;

/**
 * @openapi
 * /api/programmes:
 *   get:
 *     tags: [Programmes]
 *     summary: List all programmes
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
 *         description: Search by name or code
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, code, level, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [UNDERGRADUATE, POSTGRADUATE, DIPLOMA, CERTIFICATE]
 *         description: Filter by programme level
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Programmes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authorize(...adminRoles),
  ProgrammesController.list
);

/**
 * @openapi
 * /api/programmes/{id}:
 *   get:
 *     tags: [Programmes]
 *     summary: Get programme by ID
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
 *         description: Programme retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Programme not found
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  ProgrammesController.getById
);

/**
 * @openapi
 * /api/programmes:
 *   post:
 *     tags: [Programmes]
 *     summary: Create a new programme
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, departmentId]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Programme name
 *               code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *                 description: Programme code
 *               departmentId:
 *                 type: string
 *                 description: Department ID
 *               level:
 *                 type: string
 *                 enum: [UNDERGRADUATE, POSTGRADUATE, DIPLOMA, CERTIFICATE]
 *                 description: Programme level
 *               durationYears:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Duration in years
 *     responses:
 *       201:
 *         description: Programme created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createProgrammeSchema),
  ProgrammesController.create
);

/**
 * @openapi
 * /api/programmes/{id}:
 *   patch:
 *     tags: [Programmes]
 *     summary: Update a programme
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
 *               name:
 *                 type: string
 *                 minLength: 2
 *               code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *               departmentId:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [UNDERGRADUATE, POSTGRADUATE, DIPLOMA, CERTIFICATE]
 *               durationYears:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Programme updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Programme not found
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateProgrammeSchema),
  ProgrammesController.update
);

/**
 * @openapi
 * /api/programmes/{id}:
 *   delete:
 *     tags: [Programmes]
 *     summary: Soft delete a programme
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
 *         description: Programme deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Programme not found
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  ProgrammesController.delete
);

export default router;
