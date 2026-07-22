import { Router } from "express";
import { FacultiesController } from "./faculties.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createFacultySchema, updateFacultySchema } from "./faculties.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN"] as const;

/**
 * @openapi
 * /api/faculties:
 *   get:
 *     tags: [Faculties]
 *     summary: List all faculties
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
 *           enum: [name, code, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: campusId
 *         schema:
 *           type: string
 *         description: Filter by campus ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Faculties retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authorize(...adminRoles),
  FacultiesController.list
);

/**
 * @openapi
 * /api/faculties/{id}:
 *   get:
 *     tags: [Faculties]
 *     summary: Get faculty by ID
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
 *         description: Faculty retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Faculty not found
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  FacultiesController.getById
);

/**
 * @openapi
 * /api/faculties:
 *   post:
 *     tags: [Faculties]
 *     summary: Create a new faculty
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, campusId]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Faculty name
 *               code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *                 description: Faculty code
 *               campusId:
 *                 type: string
 *                 description: Campus ID
 *               deanId:
 *                 type: string
 *                 description: Dean user ID
 *     responses:
 *       201:
 *         description: Faculty created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createFacultySchema),
  FacultiesController.create
);

/**
 * @openapi
 * /api/faculties/{id}:
 *   patch:
 *     tags: [Faculties]
 *     summary: Update a faculty
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
 *               campusId:
 *                 type: string
 *               deanId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Faculty updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Faculty not found
 */
router.patch(
  "/:id",
  authorize(...adminRoles),
  validate(updateFacultySchema),
  FacultiesController.update
);

/**
 * @openapi
 * /api/faculties/{id}:
 *   delete:
 *     tags: [Faculties]
 *     summary: Soft delete a faculty
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
 *         description: Faculty deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Faculty not found
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  FacultiesController.delete
);

export default router;
