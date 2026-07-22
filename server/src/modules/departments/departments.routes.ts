import { Router } from "express";
import { DepartmentsController } from "./departments.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createDepartmentSchema, updateDepartmentSchema } from "./departments.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN"] as const;

/**
 * @openapi
 * /api/departments:
 *   get:
 *     tags: [Departments]
 *     summary: List all departments
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
 *         name: facultyId
 *         schema:
 *           type: string
 *         description: Filter by faculty ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authorize(...adminRoles),
  DepartmentsController.list
);

/**
 * @openapi
 * /api/departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get department by ID
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
 *         description: Department retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  DepartmentsController.getById
);

/**
 * @openapi
 * /api/departments:
 *   post:
 *     tags: [Departments]
 *     summary: Create a new department
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, facultyId]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Department name
 *               code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *                 description: Department code
 *               facultyId:
 *                 type: string
 *                 description: Faculty ID
 *               hodId:
 *                 type: string
 *                 description: Head of Department user ID
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createDepartmentSchema),
  DepartmentsController.create
);

/**
 * @openapi
 * /api/departments/{id}:
 *   patch:
 *     tags: [Departments]
 *     summary: Update a department
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
 *               facultyId:
 *                 type: string
 *               hodId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateDepartmentSchema),
  DepartmentsController.update
);

/**
 * @openapi
 * /api/departments/{id}:
 *   delete:
 *     tags: [Departments]
 *     summary: Soft delete a department
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
 *         description: Department deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  DepartmentsController.delete
);

export default router;
