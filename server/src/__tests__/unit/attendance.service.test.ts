import { describe, it, expect, vi, beforeEach } from "vitest";
import { AttendanceService } from "../../modules/attendance/attendance.service";

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findExistingRecord: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getAttendanceStats: vi.fn(),
    resolveSessionMeta: vi.fn(),
    createAuditLog: vi.fn(),
  },
}));

vi.mock("../../modules/attendance/attendance.repository", () => {
  return {
    AttendanceRepository: class {
      constructor() {
        Object.assign(this, mockRepo);
      }
    },
  };
});

const mockCtx = { actorId: "actor-1", ipAddress: "127.0.0.1", userAgent: "test" };

const mockRecord = {
  id: "att-1",
  sessionId: "session-1",
  studentId: "student-1",
  status: "PRESENT",
  signedInAt: new Date(),
  signInMethod: "QR",
  deviceFingerprint: null,
  student: { id: "student-1", firstName: "John", lastName: "Doe", email: "john@test.com", studentNumber: "S001" },
};

describe("AttendanceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.resolveSessionMeta.mockResolvedValue({
      courseOfferingId: "co-1",
      lecturerId: "lecturer-1",
      facultyId: "fac-1",
    });
  });

  describe("markAttendance", () => {
    it("should create record when no duplicate exists", async () => {
      mockRepo.findExistingRecord.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockRecord);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await AttendanceService.markAttendance(
        {
          sessionId: "session-1",
          studentId: "student-1",
          status: "PRESENT",
          signInMethod: "QR",
          deviceFingerprint: null,
        },
        mockCtx,
      );

      expect(mockRepo.findExistingRecord).toHaveBeenCalledWith("session-1", "student-1");
      expect(mockRepo.create).toHaveBeenCalledWith({
        sessionId: "session-1",
        studentId: "student-1",
        status: "PRESENT",
        signInMethod: "QR",
        deviceFingerprint: null,
      });
      expect(mockRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "actor-1",
          entityType: "AttendanceRecord",
          entityId: "att-1",
        }),
        mockCtx,
      );
      expect(result).toEqual(mockRecord);
    });

    it("should throw conflict when duplicate exists", async () => {
      mockRepo.findExistingRecord.mockResolvedValue({ id: "existing-1", status: "PRESENT" });

      await expect(
        AttendanceService.markAttendance(
          {
            sessionId: "session-1",
            studentId: "student-1",
            status: "PRESENT",
            signInMethod: "QR",
            deviceFingerprint: null,
          },
          mockCtx,
        ),
      ).rejects.toThrow("Attendance already recorded for this student in this session");

      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("bulkMarkAttendance", () => {
    it("should return correct marked/skipped counts", async () => {
      mockRepo.createMany.mockResolvedValue(2);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await AttendanceService.bulkMarkAttendance(
        {
          sessionId: "session-1",
          records: [
            { studentId: "s1", status: "PRESENT" },
            { studentId: "s2", status: "LATE" },
            { studentId: "s3", status: "ABSENT" },
          ],
          signInMethod: "ADMIN_OVERRIDE",
        },
        mockCtx,
      );

      expect(mockRepo.createMany).toHaveBeenCalledWith([
        { sessionId: "session-1", studentId: "s1", status: "PRESENT", signInMethod: "ADMIN_OVERRIDE" },
        { sessionId: "session-1", studentId: "s2", status: "LATE", signInMethod: "ADMIN_OVERRIDE" },
        { sessionId: "session-1", studentId: "s3", status: "ABSENT", signInMethod: "ADMIN_OVERRIDE" },
      ]);
      expect(result).toEqual({ marked: 2, skipped: 1 });
    });
  });

  describe("update", () => {
    it("should throw not found for invalid id", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        AttendanceService.update("nonexistent", { status: "LATE" }, mockCtx),
      ).rejects.toThrow("Attendance record not found");

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("should update and return the record when found", async () => {
      const existing = { ...mockRecord };
      const updated = { ...mockRecord, status: "LATE" };
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.update.mockResolvedValue(updated);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await AttendanceService.update("att-1", { status: "LATE" }, mockCtx);

      expect(mockRepo.update).toHaveBeenCalledWith("att-1", { status: "LATE" });
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("should throw not found for invalid id", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(AttendanceService.delete("nonexistent", mockCtx)).rejects.toThrow(
        "Attendance record not found",
      );

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it("should delete and return success message when found", async () => {
      mockRepo.findById.mockResolvedValue(mockRecord);
      mockRepo.delete.mockResolvedValue(undefined);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await AttendanceService.delete("att-1", mockCtx);

      expect(mockRepo.delete).toHaveBeenCalledWith("att-1");
      expect(result).toEqual({ message: "Attendance record deleted successfully" });
    });
  });

  describe("getSessionStats", () => {
    it("should return correct stats", async () => {
      const stats = { total: 30, present: 20, late: 5, absent: 3, excused: 2 };
      mockRepo.getAttendanceStats.mockResolvedValue(stats);

      const result = await AttendanceService.getSessionStats("session-1");

      expect(mockRepo.getAttendanceStats).toHaveBeenCalledWith("session-1");
      expect(result).toEqual(stats);
    });
  });

  describe("list", () => {
    it("should return paginated results", async () => {
      const records = [mockRecord];
      mockRepo.findAll.mockResolvedValue({ attendanceRecords: records, total: 1 });

      const query = { page: 1, limit: 10, sortBy: "signedInAt" as const, sortOrder: "desc" as const };
      const result = await AttendanceService.list(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        attendanceRecords: records,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it("should calculate correct totalPages", async () => {
      mockRepo.findAll.mockResolvedValue({ attendanceRecords: [], total: 25 });

      const query = { page: 1, limit: 10, sortBy: "signedInAt" as const, sortOrder: "desc" as const };
      const result = await AttendanceService.list(query);

      expect(result.meta.totalPages).toBe(3);
    });
  });
});
