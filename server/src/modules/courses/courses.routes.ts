import { Router } from "express";
import { CoursesController } from "./courses.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createCourseSchema, updateCourseSchema } from "./courses.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN", "DEPARTMENT_ADMIN"] as const;

/**
 * @openapi
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: List all courses
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
 *         schema: { type: string, enum: [code, title, level, creditUnits, createdAt, updatedAt] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: level
 *         schema: { type: integer }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 */
router.get(
  "/",
  authorize(...adminRoles),
  CoursesController.list
);

/**
 * @openapi
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get a course by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  CoursesController.getById
);

/**
 * @openapi
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, title, departmentId]
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *               title:
 *                 type: string
 *                 minLength: 2
 *               description:
 *                 type: string
 *               creditUnits:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 20
 *               departmentId:
 *                 type: string
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createCourseSchema),
  CoursesController.create
);

/**
 * @openapi
 * /api/courses/{id}:
 *   patch:
 *     tags: [Courses]
 *     summary: Update a course
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
 *               code:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               creditUnits:
 *                 type: number
 *               departmentId:
 *                 type: string
 *               level:
 *                 type: integer
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course updated successfully
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateCourseSchema),
  CoursesController.update
);

/**
 * @openapi
 * /api/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Soft delete a course
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course deleted successfully
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  CoursesController.delete
);

export default router;
