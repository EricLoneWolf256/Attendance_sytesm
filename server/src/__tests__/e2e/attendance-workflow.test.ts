import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSessionRepo = {
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
};

const mockAttendanceRepo = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findExistingRecord: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  countBySession: vi.fn(),
  getAttendanceStats: vi.fn(),
  resolveSessionMeta: vi.fn(),
  createAuditLog: vi.fn(),
};

vi.mock("../../modules/class-sessions/class-sessions.repository", () => ({
  ClassSessionsRepository: vi.fn().mockImplementation(function () {
    return mockSessionRepo;
  }),
}));

vi.mock("../../modules/attendance/attendance.repository", () => ({
  AttendanceRepository: vi.fn().mockImplementation(function () {
    return mockAttendanceRepo;
  }),
}));

const { ClassSessionsService } = await import("../../modules/class-sessions/class-sessions.service");
const { AttendanceService } = await import("../../modules/attendance/attendance.service");

const auditCtx = {
  actorId: "lecturer-1",
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
};

function makeSessionBase() {
  return {
    id: "session-1",
    courseOfferingId: "co-1",
    semesterId: "sem-1",
    venueId: "venue-1",
    startedBy: "lecturer-1",
    date: new Date("2024-10-15"),
    modeOfTeaching: "PHYSICAL",
    startTime: new Date("2024-10-15T08:00:00.000Z"),
    endTime: null as Date | null,
    actualStartTime: null as Date | null,
    actualEndTime: null as Date | null,
    duration: null as number | null,
    topic: "Introduction to Algorithms",
    materials: null as string | null,
    maxCheckInTime: new Date("2024-10-15T08:30:00.000Z"),
    lecturerConfirmedAt: null as Date | null,
    closedAt: null as Date | null,
    createdAt: new Date("2024-10-14"),
    updatedAt: new Date("2024-10-14"),
    courseOffering: {
      id: "co-1",
      course: { code: "CS201", title: "Data Structures" },
      programme: { name: "BSc Computer Science", code: "BCS" },
      semester: { name: "Semester 1", code: "SEM1" },
    },
    venue: { id: "venue-1", name: "Lab 3", code: "LAB3", capacity: 60 },
    starter: { id: "lecturer-1", firstName: "John", lastName: "Lecturer", email: "john@umu.ac.ug" },
    _count: { attendanceRecords: 0 },
  };
}

function makeAttendanceRecord(studentId: string, status = "PRESENT") {
  return {
    id: `att-${studentId}`,
    sessionId: "session-1",
    studentId,
    status,
    signedInAt: new Date(),
    signInMethod: "SELF",
    deviceFingerprint: null,
    student: {
      id: studentId,
      firstName: `Student ${studentId}`,
      lastName: "Test",
      email: `${studentId}@stud.umu.ac.ug`,
      studentNumber: `2024-${studentId}`,
    },
  };
}

function makeSession(status: string) {
  return { ...makeSessionBase(), status };
}

describe("Attendance Workflow E2E", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAttendanceRepo.resolveSessionMeta.mockResolvedValue({
      courseOfferingId: "co-1",
      lecturerId: "lecturer-1",
      facultyId: "fac-1",
    });
    mockSessionRepo.resolveOffering.mockResolvedValue({ facultyId: "fac-1" });
  });

  it("should complete a full attendance workflow: create → start → mark → stats → close", async () => {
    const scheduledSession = makeSession("SCHEDULED");
    const openSession = makeSession("OPEN");
    const closedSession = { ...makeSession("CLOSED"), closedAt: new Date() };

    mockSessionRepo.create.mockResolvedValue(scheduledSession);
    mockSessionRepo.findById.mockResolvedValue(scheduledSession);
    mockSessionRepo.startSession.mockResolvedValue(openSession);
    mockSessionRepo.closeSession.mockResolvedValue(closedSession);
    mockSessionRepo.createAuditLog.mockResolvedValue({});

    mockAttendanceRepo.findExistingRecord.mockResolvedValue(null);
    mockAttendanceRepo.create.mockImplementation((data: { sessionId: string; studentId: string; status?: string }) =>
      Promise.resolve(makeAttendanceRecord(data.studentId, data.status ?? "PRESENT"))
    );
    mockAttendanceRepo.createAuditLog.mockResolvedValue({});

    mockAttendanceRepo.getAttendanceStats.mockResolvedValue({
      total: 2,
      present: 1,
      late: 1,
      absent: 0,
      excused: 0,
    });

    // 1. Create session
    const createdSession = await ClassSessionsService.create(
      {
        courseOfferingId: "co-1",
        semesterId: "sem-1",
        venueId: "venue-1",
        date: new Date("2024-10-15"),
        modeOfTeaching: "PHYSICAL" as const,
        startTime: new Date("2024-10-15T08:00:00.000Z"),
        topic: "Introduction to Algorithms",
      },
      auditCtx
    );
    expect(createdSession.status).toBe("SCHEDULED");
    expect(mockSessionRepo.create).toHaveBeenCalledOnce();
    expect(mockSessionRepo.createAuditLog).toHaveBeenCalledOnce();

    // 2. Start session
    mockSessionRepo.findById.mockResolvedValue(scheduledSession);
    const startedSession = await ClassSessionsService.startSession("session-1", auditCtx);
    expect(startedSession.status).toBe("OPEN");
    expect(mockSessionRepo.startSession).toHaveBeenCalledWith("session-1");

    // 3. Mark attendance for student 1
    mockSessionRepo.findById.mockResolvedValue(openSession);
    const record1 = await AttendanceService.markAttendance(
      { sessionId: "session-1", studentId: "student-1", status: "PRESENT", signInMethod: "SELF" },
      auditCtx
    );
    expect(record1.studentId).toBe("student-1");
    expect(record1.status).toBe("PRESENT");
    expect(mockAttendanceRepo.findExistingRecord).toHaveBeenCalledWith("session-1", "student-1");
    expect(mockAttendanceRepo.create).toHaveBeenCalledOnce();
    expect(mockAttendanceRepo.createAuditLog).toHaveBeenCalledOnce();

    // 4. Mark attendance for student 2
    const record2 = await AttendanceService.markAttendance(
      { sessionId: "session-1", studentId: "student-2", status: "LATE", signInMethod: "QR" },
      auditCtx
    );
    expect(record2.studentId).toBe("student-2");
    expect(record2.status).toBe("LATE");

    // 5. Get session stats
    const stats = await AttendanceService.getSessionStats("session-1");
    expect(stats.total).toBe(2);
    expect(stats.present).toBe(1);
    expect(stats.late).toBe(1);
    expect(stats.absent).toBe(0);
    expect(mockAttendanceRepo.getAttendanceStats).toHaveBeenCalledWith("session-1");

    // 6. Close session
    mockSessionRepo.findById.mockResolvedValue(openSession);
    const closed = await ClassSessionsService.closeSession("session-1", auditCtx);
    expect(closed.status).toBe("CLOSED");
    expect(mockSessionRepo.closeSession).toHaveBeenCalledWith("session-1");
  });

  it("should prevent duplicate attendance for same student in same session", async () => {
    mockSessionRepo.findById.mockResolvedValue(makeSession("OPEN"));
    mockAttendanceRepo.findExistingRecord.mockResolvedValue({ id: "existing-record", status: "PRESENT" });

    await expect(
      AttendanceService.markAttendance(
        { sessionId: "session-1", studentId: "student-1", status: "PRESENT", signInMethod: "SELF" },
        auditCtx
      )
    ).rejects.toThrow("Attendance already recorded for this student in this session");

    expect(mockAttendanceRepo.create).not.toHaveBeenCalled();
  });

  it("should prevent starting a session that is not SCHEDULED", async () => {
    mockSessionRepo.findById.mockResolvedValue(makeSession("OPEN"));

    await expect(ClassSessionsService.startSession("session-1", auditCtx)).rejects.toThrow(
      'Cannot start session in "OPEN" status'
    );
    expect(mockSessionRepo.startSession).not.toHaveBeenCalled();
  });

  it("should prevent closing a session that is not OPEN", async () => {
    mockSessionRepo.findById.mockResolvedValue(makeSession("SCHEDULED"));

    await expect(ClassSessionsService.closeSession("session-1", auditCtx)).rejects.toThrow(
      'Cannot close session in "SCHEDULED" status'
    );
    expect(mockSessionRepo.closeSession).not.toHaveBeenCalled();
  });

  it("should handle bulk attendance marking", async () => {
    mockAttendanceRepo.createMany.mockResolvedValue(3);
    mockAttendanceRepo.createAuditLog.mockResolvedValue({});

    const result = await AttendanceService.bulkMarkAttendance(
      {
        sessionId: "session-1",
        records: [
          { studentId: "s1", status: "PRESENT" },
          { studentId: "s2", status: "LATE" },
          { studentId: "s3", status: "EXCUSED" },
        ],
        signInMethod: "ADMIN_OVERRIDE",
      },
      auditCtx
    );

    expect(result.marked).toBe(3);
    expect(result.skipped).toBe(0);
    expect(mockAttendanceRepo.createMany).toHaveBeenCalledOnce();
    expect(mockAttendanceRepo.createAuditLog).toHaveBeenCalledOnce();
  });

  it("should handle bulk attendance with partial duplicates", async () => {
    mockAttendanceRepo.createMany.mockResolvedValue(2);
    mockAttendanceRepo.createAuditLog.mockResolvedValue({});

    const result = await AttendanceService.bulkMarkAttendance(
      {
        sessionId: "session-1",
        records: [
          { studentId: "s1", status: "PRESENT" },
          { studentId: "s2", status: "PRESENT" },
          { studentId: "s3", status: "LATE" },
        ],
        signInMethod: "ADMIN_OVERRIDE",
      },
      auditCtx
    );

    expect(result.marked).toBe(2);
    expect(result.skipped).toBe(1);
  });

  it("should prevent starting a non-existent session", async () => {
    mockSessionRepo.findById.mockResolvedValue(null);

    await expect(ClassSessionsService.startSession("nonexistent", auditCtx)).rejects.toThrow(
      "Class session not found"
    );
  });

  it("should prevent closing a non-existent session", async () => {
    mockSessionRepo.findById.mockResolvedValue(null);

    await expect(ClassSessionsService.closeSession("nonexistent", auditCtx)).rejects.toThrow(
      "Class session not found"
    );
  });

  it("should allow updating a scheduled session", async () => {
    const scheduledSession = makeSession("SCHEDULED");
    const updatedSession = { ...scheduledSession, topic: "Updated Topic" };

    mockSessionRepo.findById.mockResolvedValue(scheduledSession);
    mockSessionRepo.update.mockResolvedValue(updatedSession);
    mockSessionRepo.createAuditLog.mockResolvedValue({});

    const result = await ClassSessionsService.update(
      "session-1",
      { topic: "Updated Topic" },
      auditCtx
    );
    expect(result.topic).toBe("Updated Topic");
    expect(mockSessionRepo.update).toHaveBeenCalledWith("session-1", { topic: "Updated Topic" });
  });

  it("should prevent status change on a non-SCHEDULED session via update", async () => {
    const openSession = makeSession("OPEN");
    mockSessionRepo.findById.mockResolvedValue(openSession);

    await expect(
      ClassSessionsService.update("session-1", { status: "CLOSED" }, auditCtx)
    ).rejects.toThrow('Cannot update session in "OPEN" status');

    expect(mockSessionRepo.update).not.toHaveBeenCalled();
  });

  it("should list attendance records with pagination", async () => {
    const records = [makeAttendanceRecord("s1"), makeAttendanceRecord("s2")];
    mockAttendanceRepo.findAll.mockResolvedValue({ attendanceRecords: records, total: 2 });

    const result = await AttendanceService.list({
      page: 1,
      limit: 20,
      sortBy: "signedInAt",
      sortOrder: "desc",
    });

    expect(result.attendanceRecords).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(result.meta.page).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it("should get attendance record by id", async () => {
    const record = makeAttendanceRecord("student-1");
    mockAttendanceRepo.findById.mockResolvedValue(record);

    const result = await AttendanceService.getById(record.id);
    expect(result.studentId).toBe("student-1");
  });

  it("should throw when getting non-existent attendance record", async () => {
    mockAttendanceRepo.findById.mockResolvedValue(null);

    await expect(AttendanceService.getById("nonexistent")).rejects.toThrow(
      "Attendance record not found"
    );
  });

  it("should update an attendance record", async () => {
    const existing = makeAttendanceRecord("student-1");
    const updated = { ...existing, status: "LATE" };

    mockAttendanceRepo.findById.mockResolvedValue(existing);
    mockAttendanceRepo.update.mockResolvedValue(updated);
    mockAttendanceRepo.createAuditLog.mockResolvedValue({});

    const result = await AttendanceService.update(
      existing.id,
      { status: "LATE" },
      auditCtx
    );
    expect(result.status).toBe("LATE");
    expect(mockAttendanceRepo.update).toHaveBeenCalledWith(existing.id, { status: "LATE" });
  });

  it("should delete an attendance record", async () => {
    const existing = makeAttendanceRecord("student-1");
    mockAttendanceRepo.findById.mockResolvedValue(existing);
    mockAttendanceRepo.delete.mockResolvedValue(undefined);
    mockAttendanceRepo.createAuditLog.mockResolvedValue({});

    const result = await AttendanceService.delete(existing.id, auditCtx);
    expect(result.message).toBe("Attendance record deleted successfully");
    expect(mockAttendanceRepo.delete).toHaveBeenCalledWith(existing.id);
  });

  it("should throw when deleting non-existent attendance record", async () => {
    mockAttendanceRepo.findById.mockResolvedValue(null);

    await expect(AttendanceService.delete("nonexistent", auditCtx)).rejects.toThrow(
      "Attendance record not found"
    );
  });

  it("should throw when updating non-existent attendance record", async () => {
    mockAttendanceRepo.findById.mockResolvedValue(null);

    await expect(
      AttendanceService.update("nonexistent", { status: "LATE" }, auditCtx)
    ).rejects.toThrow("Attendance record not found");
  });

  it("should prevent deleting an open session", async () => {
    const openSession = makeSession("OPEN");
    mockSessionRepo.findById.mockResolvedValue(openSession);

    await expect(ClassSessionsService.delete("session-1", auditCtx)).rejects.toThrow(
      "Cannot delete an open session. Close it first."
    );
  });

  it("should prevent deleting session with attendance records", async () => {
    const scheduledSession = makeSession("SCHEDULED");
    mockSessionRepo.findById.mockResolvedValue(scheduledSession);
    mockSessionRepo.countAttendanceRecords.mockResolvedValue(5);

    await expect(ClassSessionsService.delete("session-1", auditCtx)).rejects.toThrow(
      "Cannot delete session with 5 attendance record(s). Remove them first."
    );
  });
});
