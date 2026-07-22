import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClassSessionsService } from "../../modules/class-sessions/class-sessions.service";

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    startSession: vi.fn(),
    closeSession: vi.fn(),
    cancelSession: vi.fn(),
    delete: vi.fn(),
    countAttendanceRecords: vi.fn(),
    resolveOffering: vi.fn(),
    createAuditLog: vi.fn(),
  },
}));

vi.mock("../../modules/class-sessions/class-sessions.repository", () => {
  return {
    ClassSessionsRepository: class {
      constructor() {
        Object.assign(this, mockRepo);
      }
    },
  };
});

const mockCtx = { actorId: "actor-1", ipAddress: "127.0.0.1", userAgent: "test" };

const scheduledSession = {
  id: "sess-1",
  courseOfferingId: "co-1",
  semesterId: "sem-1",
  venueId: "venue-1",
  startedBy: "actor-1",
  date: new Date("2026-09-01"),
  modeOfTeaching: "PHYSICAL",
  startTime: new Date("2026-09-01T09:00:00Z"),
  endTime: new Date("2026-09-01T11:00:00Z"),
  actualStartTime: null,
  actualEndTime: null,
  duration: null,
  topic: "Introduction",
  materials: null,
  status: "SCHEDULED",
  maxCheckInTime: null,
  lecturerConfirmedAt: null,
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  courseOffering: {
    id: "co-1",
    course: { code: "CS101", title: "Intro to CS" },
    programme: { name: "BSc CS", code: "BSC-CS" },
    semester: { name: "Sem 1", code: "SEM1" },
  },
  venue: { id: "venue-1", name: "Room A", code: "RA", capacity: 50 },
  starter: { id: "actor-1", firstName: "Prof", lastName: "X", email: "prof@test.com" },
  _count: { attendanceRecords: 0 },
};

const openSession = { ...scheduledSession, id: "sess-2", status: "OPEN" };
const closedSession = { ...scheduledSession, id: "sess-3", status: "CLOSED" };

describe("ClassSessionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.resolveOffering.mockResolvedValue({ facultyId: "fac-1" });
  });

  describe("create", () => {
    it("should create session successfully", async () => {
      mockRepo.create.mockResolvedValue(scheduledSession);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await ClassSessionsService.create(
        {
          courseOfferingId: "co-1",
          semesterId: "sem-1",
          venueId: "venue-1",
          date: new Date("2026-09-01"),
          modeOfTeaching: "PHYSICAL",
          startTime: new Date("2026-09-01T09:00:00Z"),
          endTime: null,
          topic: "Introduction",
          materials: null,
          maxCheckInTime: null,
        },
        mockCtx,
      );

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ courseOfferingId: "co-1", topic: "Introduction" }),
        "actor-1",
      );
      expect(mockRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "actor-1",
          entityType: "ClassSession",
          entityId: "sess-1",
        }),
        mockCtx,
      );
      expect(result).toEqual(scheduledSession);
    });
  });

  describe("startSession", () => {
    it("should throw when session is not SCHEDULED", async () => {
      mockRepo.findById.mockResolvedValue(openSession);

      await expect(ClassSessionsService.startSession("sess-2", mockCtx)).rejects.toThrow(
        'Cannot start session in "OPEN" status',
      );

      expect(mockRepo.startSession).not.toHaveBeenCalled();
    });

    it("should start session when SCHEDULED", async () => {
      const started = { ...scheduledSession, status: "OPEN" };
      mockRepo.findById.mockResolvedValue(scheduledSession);
      mockRepo.startSession.mockResolvedValue(started);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await ClassSessionsService.startSession("sess-1", mockCtx);

      expect(mockRepo.startSession).toHaveBeenCalledWith("sess-1");
      expect(result.status).toBe("OPEN");
    });
  });

  describe("closeSession", () => {
    it("should throw when session is not OPEN", async () => {
      mockRepo.findById.mockResolvedValue(scheduledSession);

      await expect(ClassSessionsService.closeSession("sess-1", mockCtx)).rejects.toThrow(
        'Cannot close session in "SCHEDULED" status',
      );

      expect(mockRepo.closeSession).not.toHaveBeenCalled();
    });

    it("should close session when OPEN", async () => {
      const closed = { ...openSession, status: "CLOSED" };
      mockRepo.findById.mockResolvedValue(openSession);
      mockRepo.closeSession.mockResolvedValue(closed);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await ClassSessionsService.closeSession("sess-2", mockCtx);

      expect(mockRepo.closeSession).toHaveBeenCalledWith("sess-2");
      expect(result.status).toBe("CLOSED");
    });
  });

  describe("cancelSession", () => {
    it("should throw when session is already CLOSED", async () => {
      mockRepo.findById.mockResolvedValue(closedSession);

      await expect(ClassSessionsService.cancelSession("sess-3", mockCtx)).rejects.toThrow(
        'Cannot cancel session in "CLOSED" status',
      );

      expect(mockRepo.cancelSession).not.toHaveBeenCalled();
    });

    it("should throw when session is CANCELLED", async () => {
      const cancelled = { ...scheduledSession, status: "CANCELLED" };
      mockRepo.findById.mockResolvedValue(cancelled);

      await expect(ClassSessionsService.cancelSession("sess-1", mockCtx)).rejects.toThrow(
        'Cannot cancel session in "CANCELLED" status',
      );

      expect(mockRepo.cancelSession).not.toHaveBeenCalled();
    });

    it("should cancel session when SCHEDULED", async () => {
      const cancelled = { ...scheduledSession, status: "CANCELLED" };
      mockRepo.findById.mockResolvedValue(scheduledSession);
      mockRepo.cancelSession.mockResolvedValue(cancelled);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await ClassSessionsService.cancelSession("sess-1", mockCtx);

      expect(mockRepo.cancelSession).toHaveBeenCalledWith("sess-1");
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("delete", () => {
    it("should throw when session is OPEN", async () => {
      mockRepo.findById.mockResolvedValue(openSession);

      await expect(ClassSessionsService.delete("sess-2", mockCtx)).rejects.toThrow(
        "Cannot delete an open session. Close it first.",
      );

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it("should throw when session has attendance records", async () => {
      mockRepo.findById.mockResolvedValue(scheduledSession);
      mockRepo.countAttendanceRecords.mockResolvedValue(5);

      await expect(ClassSessionsService.delete("sess-1", mockCtx)).rejects.toThrow(
        "Cannot delete session with 5 attendance record(s). Remove them first.",
      );

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it("should delete and return success when SCHEDULED with no attendance", async () => {
      mockRepo.findById.mockResolvedValue(scheduledSession);
      mockRepo.countAttendanceRecords.mockResolvedValue(0);
      mockRepo.delete.mockResolvedValue(undefined);
      mockRepo.createAuditLog.mockResolvedValue({});

      const result = await ClassSessionsService.delete("sess-1", mockCtx);

      expect(mockRepo.delete).toHaveBeenCalledWith("sess-1");
      expect(result).toEqual({ message: "Class session deleted successfully" });
    });
  });

  describe("list", () => {
    it("should return paginated results", async () => {
      const sessions = [scheduledSession];
      mockRepo.findAll.mockResolvedValue({ classSessions: sessions, total: 1 });

      const query = { page: 1, limit: 10, sortBy: "date" as const, sortOrder: "desc" as const };
      const result = await ClassSessionsService.list(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        classSessions: sessions,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it("should calculate correct totalPages", async () => {
      mockRepo.findAll.mockResolvedValue({ classSessions: [], total: 50 });

      const query = { page: 3, limit: 10, sortBy: "date" as const, sortOrder: "desc" as const };
      const result = await ClassSessionsService.list(query);

      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.page).toBe(3);
    });
  });
});
