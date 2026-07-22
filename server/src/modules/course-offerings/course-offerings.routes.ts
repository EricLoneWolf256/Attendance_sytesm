import { Router } from "express";
import { CourseOfferingsController } from "./course-offerings.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createCourseOfferingSchema, updateCourseOfferingSchema } from "./course-offerings.validation";

const router = Router();

router.use(authenticate);

const adminRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN"] as const;
const manageRoles = ["SUPER_ADMIN", "ADMIN", "DEPARTMENT_ADMIN"] as const;

/**
 * @openapi
 * /api/course-offerings:
 *   get:
 *     tags: [Course Offerings]
 *     summary: List all course offerings
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
 *         name: courseId
 *         schema: { type: string }
 *       - in: query
 *         name: programmeId
 *         schema: { type: string }
 *       - in: query
 *         name: semesterId
 *         schema: { type: string }
 *       - in: query
 *         name: academicYearId
 *         schema: { type: string }
 *       - in: query
 *         name: lecturerId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED] }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Course offerings retrieved successfully
 */
router.get(
  "/",
  authorize(...adminRoles),
  CourseOfferingsController.list
);

/**
 * @openapi
 * /api/course-offerings/{id}:
 *   get:
 *     tags: [Course Offerings]
 *     summary: Get a course offering by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course offering retrieved successfully
 */
router.get(
  "/:id",
  authorize(...adminRoles),
  CourseOfferingsController.getById
);

/**
 * @openapi
 * /api/course-offerings:
 *   post:
 *     tags: [Course Offerings]
 *     summary: Create a new course offering
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, programmeId, yearOfStudy, semesterId, lecturerId, academicYearId]
 *             properties:
 *               courseId:
 *                 type: string
 *               programmeId:
 *                 type: string
 *               yearOfStudy:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               semesterId:
 *                 type: string
 *               lecturerId:
 *                 type: string
 *               classRepId:
 *                 type: string
 *               academicYearId:
 *                 type: string
 *               maxEnrollment:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Course offering created successfully
 */
router.post(
  "/",
  authorize(...manageRoles),
  validate(createCourseOfferingSchema),
  CourseOfferingsController.create
);

/**
 * @openapi
 * /api/course-offerings/{id}:
 *   patch:
 *     tags: [Course Offerings]
 *     summary: Update a course offering
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
 *               lecturerId:
 *                 type: string
 *               classRepId:
 *                 type: string
 *               maxEnrollment:
 *                 type: integer
 *                 minimum: 1
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course offering updated successfully
 */
router.patch(
  "/:id",
  authorize(...manageRoles),
  validate(updateCourseOfferingSchema),
  CourseOfferingsController.update
);

/**
 * @openapi
 * /api/course-offerings/{id}:
 *   delete:
 *     tags: [Course Offerings]
 *     summary: Soft delete a course offering
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course offering deleted successfully
 */
router.delete(
  "/:id",
  authorize(...manageRoles),
  CourseOfferingsController.delete
);

export default router;
