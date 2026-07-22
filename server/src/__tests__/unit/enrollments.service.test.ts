import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnrollmentsService } from "../../modules/enrollments/enrollments.service";

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findExistingEnrollment: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createAuditLog: vi.fn(),
  },
}));

vi.mock("../../modules/enrollments/enrollments.repository", () => {
  return {
    EnrollmentsRepository: class {
      constructor() {
        Object.assign(this, mockRepo);
      }
    },
  };
});

const mockCtx = { actorId: "actor-1", ipAddress: "127.0.0.1", userAgent: "test" };

const mockEnrollment = {
  id: "enr-1",
  studentId: "student-1",
  courseOfferingId: "co-1",
  classGroupId: null,
  status: "ENROLLED",
  enrolledAt: new Date(),
  droppedAt: null,
  student: { id: "student-1", firstName: "Jane", lastName: "Smith", email: "jane@test.com", studentNumber: "S002" },
  courseOffering: {
    id: "co-1",
    course: { code: "CS101", title: "Intro to CS" },
    programme: { name: "BSc CS", code: "BSC-CS" },
    yearOfStudy: 1,
  },
  classGroup: null,
};

describe("EnrollmentsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create enrollment when no duplicate exists", async () => {
      mockRepo.findExistingEnrollment.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockEnrollment);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await EnrollmentsService.create(
        { studentId: "student-1", courseOfferingId: "co-1", classGroupId: null },
        mockCtx,
      );

      expect(mockRepo.findExistingEnrollment).toHaveBeenCalledWith("student-1", "co-1");
      expect(mockRepo.create).toHaveBeenCalledWith({
        studentId: "student-1",
        courseOfferingId: "co-1",
        classGroupId: null,
      });
      expect(mockRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "actor-1",
          entityType: "Enrollment",
          entityId: "enr-1",
        }),
        mockCtx,
      );
      expect(result).toEqual(mockEnrollment);
    });

    it("should throw conflict when student is already enrolled", async () => {
      mockRepo.findExistingEnrollment.mockResolvedValue({ id: "existing-1", status: "ENROLLED" });

      await expect(
        EnrollmentsService.create(
          { studentId: "student-1", courseOfferingId: "co-1", classGroupId: null },
          mockCtx,
        ),
      ).rejects.toThrow("Student is already enrolled in this course offering");

      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("bulkCreate", () => {
    it("should return enrolled/skipped counts", async () => {
      mockRepo.createMany.mockResolvedValue(2);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await EnrollmentsService.bulkCreate(
        { studentIds: ["s1", "s2", "s3"], courseOfferingId: "co-1" },
        mockCtx,
      );

      expect(mockRepo.createMany).toHaveBeenCalledWith([
        { studentId: "s1", courseOfferingId: "co-1" },
        { studentId: "s2", courseOfferingId: "co-1" },
        { studentId: "s3", courseOfferingId: "co-1" },
      ]);
      expect(result).toEqual({ enrolled: 2, skipped: 1 });
    });
  });

  describe("update", () => {
    it("should throw not found for invalid id", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        EnrollmentsService.update("nonexistent", { status: "DROPPED" }, mockCtx),
      ).rejects.toThrow("Enrollment not found");

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("should update and return the enrollment when found", async () => {
      const updated = { ...mockEnrollment, status: "DROPPED" };
      mockRepo.findById.mockResolvedValue(mockEnrollment);
      mockRepo.update.mockResolvedValue(updated);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await EnrollmentsService.update("enr-1", { status: "DROPPED" }, mockCtx);

      expect(mockRepo.update).toHaveBeenCalledWith("enr-1", { status: "DROPPED" });
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("should throw not found for invalid id", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(EnrollmentsService.delete("nonexistent", mockCtx)).rejects.toThrow(
        "Enrollment not found",
      );

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it("should delete and return success message when found", async () => {
      mockRepo.findById.mockResolvedValue(mockEnrollment);
      mockRepo.delete.mockResolvedValue(undefined);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await EnrollmentsService.delete("enr-1", mockCtx);

      expect(mockRepo.delete).toHaveBeenCalledWith("enr-1");
      expect(result).toEqual({ message: "Enrollment deleted successfully" });
    });
  });

  describe("list", () => {
    it("should return paginated results", async () => {
      const enrollments = [mockEnrollment];
      mockRepo.findAll.mockResolvedValue({ enrollments, total: 1 });

      const query = { page: 1, limit: 10, sortBy: "enrolledAt" as const, sortOrder: "desc" as const };
      const result = await EnrollmentsService.list(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        enrollments,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it("should calculate correct totalPages", async () => {
      mockRepo.findAll.mockResolvedValue({ enrollments: [], total: 45 });

      const query = { page: 2, limit: 10, sortBy: "enrolledAt" as const, sortOrder: "desc" as const };
      const result = await EnrollmentsService.list(query);

      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.page).toBe(2);
    });
  });
});
