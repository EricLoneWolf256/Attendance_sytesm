import { describe, it, expect, vi, beforeEach } from "vitest";
import { eventBus, BUS_EVENTS } from "@/sockets/eventBus";
import { SOCKET_EVENTS } from "@/sockets/events";
import { rooms, ADMIN_ROLES } from "@/sockets/rooms";
import { registerSessionHandlers } from "@/sockets/handlers/session.handler";
import { registerAttendanceHandlers } from "@/sockets/handlers/attendance.handler";

// ─── EventBus Unit Tests ───

describe("Socket Event Bus", () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it("should emit and receive SESSION_CREATED event", () => {
    const handler = vi.fn();
    eventBus.on(BUS_EVENTS.SESSION_CREATED, handler);

    const payload = {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      date: "2026-01-15",
      topic: "Intro",
    };
    eventBus.emit(BUS_EVENTS.SESSION_CREATED, payload);

    expect(handler).toHaveBeenCalledWith(payload);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("should emit and receive SESSION_STARTED event", () => {
    const handler = vi.fn();
    eventBus.on(BUS_EVENTS.SESSION_STARTED, handler);

    const payload = {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      session: { id: "s1", status: "OPEN" },
    };
    eventBus.emit(BUS_EVENTS.SESSION_STARTED, payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it("should emit and receive SESSION_CLOSED event", () => {
    const handler = vi.fn();
    eventBus.on(BUS_EVENTS.SESSION_CLOSED, handler);

    const payload = {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      session: { id: "s1", status: "CLOSED" },
    };
    eventBus.emit(BUS_EVENTS.SESSION_CLOSED, payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it("should emit and receive ATTENDANCE_CHECKED_IN event", () => {
    const handler = vi.fn();
    eventBus.on(BUS_EVENTS.ATTENDANCE_CHECKED_IN, handler);

    const payload = {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      record: { id: "a1", studentId: "st1", status: "PRESENT" },
      stats: { total: 30, present: 1, late: 0, absent: 29, excused: 0 },
    };
    eventBus.emit(BUS_EVENTS.ATTENDANCE_CHECKED_IN, payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it("should emit and receive ATTENDANCE_UPDATED event", () => {
    const handler = vi.fn();
    eventBus.on(BUS_EVENTS.ATTENDANCE_UPDATED, handler);

    const payload = {
      sessionId: "s1",
      courseOfferingId: "co1",
      record: { id: "a1", status: "LATE" },
      stats: { total: 30, present: 0, late: 1, absent: 29, excused: 0 },
    };
    eventBus.emit(BUS_EVENTS.ATTENDANCE_UPDATED, payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it("should emit and receive ATTENDANCE_SUMMARY_UPDATED event", () => {
    const handler = vi.fn();
    eventBus.on(BUS_EVENTS.ATTENDANCE_SUMMARY_UPDATED, handler);

    const payload = {
      sessionId: "s1",
      courseOfferingId: "co1",
      stats: { total: 30, present: 25, late: 3, absent: 1, excused: 1 },
    };
    eventBus.emit(BUS_EVENTS.ATTENDANCE_SUMMARY_UPDATED, payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it("should support multiple listeners on the same event", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    eventBus.on(BUS_EVENTS.SESSION_CREATED, handler1);
    eventBus.on(BUS_EVENTS.SESSION_CREATED, handler2);

    eventBus.emit(BUS_EVENTS.SESSION_CREATED, { sessionId: "s1" });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it("should not cross-contaminate different event types", () => {
    const sessionHandler = vi.fn();
    const attendanceHandler = vi.fn();
    eventBus.on(BUS_EVENTS.SESSION_CREATED, sessionHandler);
    eventBus.on(BUS_EVENTS.ATTENDANCE_CHECKED_IN, attendanceHandler);

    eventBus.emit(BUS_EVENTS.SESSION_CREATED, { sessionId: "s1" });

    expect(sessionHandler).toHaveBeenCalledOnce();
    expect(attendanceHandler).not.toHaveBeenCalled();
  });
});

// ─── Room Builder Tests ───

describe("Socket Rooms", () => {
  it("should build session room name correctly", () => {
    expect(rooms.session("abc")).toBe("session:abc");
  });

  it("should build course-offering room name correctly", () => {
    expect(rooms.courseOffering("co-1")).toBe("course-offering:co-1");
  });

  it("should build lecturer room name correctly", () => {
    expect(rooms.lecturer("l-1")).toBe("lecturer:l-1");
  });

  it("should build faculty room name correctly", () => {
    expect(rooms.faculty("f-1")).toBe("faculty:f-1");
  });

  it("should build admin room name correctly", () => {
    expect(rooms.admin()).toBe("admins");
  });

  it("should build user room name correctly", () => {
    expect(rooms.user("u-1")).toBe("user:u-1");
  });
});

// ─── Admin Roles Tests ───

describe("Socket Admin Roles", () => {
  it("should include SUPER_ADMIN", () => {
    expect(ADMIN_ROLES.has("SUPER_ADMIN")).toBe(true);
  });

  it("should include ADMIN", () => {
    expect(ADMIN_ROLES.has("ADMIN")).toBe(true);
  });

  it("should include FACULTY_ADMIN", () => {
    expect(ADMIN_ROLES.has("FACULTY_ADMIN")).toBe(true);
  });

  it("should include DEPARTMENT_ADMIN", () => {
    expect(ADMIN_ROLES.has("DEPARTMENT_ADMIN")).toBe(true);
  });

  it("should not include LECTURER", () => {
    expect(ADMIN_ROLES.has("LECTURER")).toBe(false);
  });

  it("should not include STUDENT", () => {
    expect(ADMIN_ROLES.has("STUDENT")).toBe(false);
  });
});

// ─── Event Constants Tests ───

describe("Socket Event Constants", () => {
  it("should have all session events", () => {
    expect(SOCKET_EVENTS.SESSION_CREATED).toBe("session.created");
    expect(SOCKET_EVENTS.SESSION_STARTED).toBe("session.started");
    expect(SOCKET_EVENTS.SESSION_UPDATED).toBe("session.updated");
    expect(SOCKET_EVENTS.SESSION_CLOSED).toBe("session.closed");
  });

  it("should have all attendance events", () => {
    expect(SOCKET_EVENTS.ATTENDANCE_CHECKED_IN).toBe("attendance.checked_in");
    expect(SOCKET_EVENTS.ATTENDANCE_UPDATED).toBe("attendance.updated");
    expect(SOCKET_EVENTS.ATTENDANCE_SUMMARY_UPDATED).toBe("attendance.summary_updated");
  });

  it("should have room join/leave events", () => {
    expect(SOCKET_EVENTS.JOIN_SESSION).toBe("join-session");
    expect(SOCKET_EVENTS.LEAVE_SESSION).toBe("leave-session");
    expect(SOCKET_EVENTS.JOIN_COURSE_OFFERING).toBe("join-course-offering");
    expect(SOCKET_EVENTS.LEAVE_COURSE_OFFERING).toBe("leave-course-offering");
    expect(SOCKET_EVENTS.JOIN_LECTURER).toBe("join-lecturer");
    expect(SOCKET_EVENTS.LEAVE_LECTURER).toBe("leave-lecturer");
    expect(SOCKET_EVENTS.JOIN_FACULTY).toBe("join-faculty");
    expect(SOCKET_EVENTS.LEAVE_FACULTY).toBe("leave-faculty");
    expect(SOCKET_EVENTS.JOIN_ADMIN).toBe("join-admin");
    expect(SOCKET_EVENTS.LEAVE_ADMIN).toBe("leave-admin");
  });
});

// ─── Bus Event Constants Tests ───

describe("Domain Event Bus Constants", () => {
  it("should have all domain events", () => {
    expect(BUS_EVENTS.SESSION_CREATED).toBe("domain:session.created");
    expect(BUS_EVENTS.SESSION_STARTED).toBe("domain:session.started");
    expect(BUS_EVENTS.SESSION_UPDATED).toBe("domain:session.updated");
    expect(BUS_EVENTS.SESSION_CLOSED).toBe("domain:session.closed");
    expect(BUS_EVENTS.ATTENDANCE_CHECKED_IN).toBe("domain:attendance.checked_in");
    expect(BUS_EVENTS.ATTENDANCE_UPDATED).toBe("domain:attendance.updated");
    expect(BUS_EVENTS.ATTENDANCE_SUMMARY_UPDATED).toBe("domain:attendance.summary_updated");
  });
});

// ─── Socket.IO Handler Registration Tests ───

describe("Socket Handler Registration", () => {
  it("should register session handlers that forward domain events to Socket.IO", () => {
    const mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;

    eventBus.removeAllListeners();
    registerSessionHandlers(mockIo);

    eventBus.emit(BUS_EVENTS.SESSION_CREATED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      date: "2026-01-15",
      topic: "Test",
    });

    expect(mockIo.to).toHaveBeenCalledWith("course-offering:co1");
    expect(mockIo.to).toHaveBeenCalledWith("lecturer:l1");
    expect(mockIo.to).toHaveBeenCalledWith("faculty:f1");
    expect(mockIo.emit).toHaveBeenCalledWith(SOCKET_EVENTS.SESSION_CREATED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      date: "2026-01-15",
      topic: "Test",
    });
  });

  it("should register attendance handlers that forward to session room", () => {
    const mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;

    eventBus.removeAllListeners();
    registerAttendanceHandlers(mockIo);

    eventBus.emit(BUS_EVENTS.ATTENDANCE_CHECKED_IN, {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      record: { id: "a1", studentId: "st1" },
      stats: { total: 30, present: 1, late: 0, absent: 29, excused: 0 },
    });

    expect(mockIo.to).toHaveBeenCalledWith("session:s1");
    expect(mockIo.to).toHaveBeenCalledWith("lecturer:l1");
    expect(mockIo.emit).toHaveBeenCalledWith(
      SOCKET_EVENTS.ATTENDANCE_CHECKED_IN,
      expect.objectContaining({ sessionId: "s1" })
    );
  });

  it("should register attendance summary handler", () => {
    const mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as any;

    eventBus.removeAllListeners();
    registerAttendanceHandlers(mockIo);

    eventBus.emit(BUS_EVENTS.ATTENDANCE_SUMMARY_UPDATED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      stats: { total: 30, present: 25, late: 3, absent: 1, excused: 1 },
    });

    expect(mockIo.to).toHaveBeenCalledWith("session:s1");
    expect(mockIo.emit).toHaveBeenCalledWith(
      SOCKET_EVENTS.ATTENDANCE_SUMMARY_UPDATED,
      expect.objectContaining({
        sessionId: "s1",
        stats: { total: 30, present: 25, late: 3, absent: 1, excused: 1 },
      })
    );
  });
});

// ─── Full Attendance Flow Simulation ───

describe("Full Real-Time Attendance Flow", () => {
  let emittedEvents: { event: string; room: string; data: unknown }[];

  function makeMockIo() {
    emittedEvents = [];
    return {
      to: vi.fn().mockImplementation((room: string) => ({
        emit: (event: string, data: unknown) => {
          emittedEvents.push({ room, event, data });
        },
      })),
      emit: vi.fn(),
    } as any;
  }

  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it("should emit session.created → session.started → attendance.checked_in → session.closed in order", () => {
    const mockIo = makeMockIo();
    registerSessionHandlers(mockIo);
    registerAttendanceHandlers(mockIo);

    // 1. Session created
    eventBus.emit(BUS_EVENTS.SESSION_CREATED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      date: "2026-01-15",
      topic: "Binary Trees",
    });

    // 2. Session started
    eventBus.emit(BUS_EVENTS.SESSION_STARTED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      session: { id: "s1", status: "OPEN" },
    });

    // 3. Student checks in
    eventBus.emit(BUS_EVENTS.ATTENDANCE_CHECKED_IN, {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      record: { id: "a1", studentId: "st1", status: "PRESENT" },
      stats: { total: 30, present: 1, late: 0, absent: 29, excused: 0 },
    });

    // 4. Stats updated
    eventBus.emit(BUS_EVENTS.ATTENDANCE_SUMMARY_UPDATED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      stats: { total: 30, present: 15, late: 3, absent: 10, excused: 2 },
    });

    // 5. Session closed
    eventBus.emit(BUS_EVENTS.SESSION_CLOSED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      lecturerId: "l1",
      facultyId: "f1",
      session: { id: "s1", status: "CLOSED" },
    });

    const eventNames = emittedEvents.map((e) => e.event);
    // Each event emits to multiple rooms, so we see duplicates in the flat list
    // session.created → 3 rooms, session.started → 2 rooms, attendance.checked_in → 2 rooms,
    // attendance.summary_updated → 1 room, session.closed → 3 rooms
    const sessionCreatedCount = eventNames.filter((n) => n === SOCKET_EVENTS.SESSION_CREATED).length;
    const sessionStartedCount = eventNames.filter((n) => n === SOCKET_EVENTS.SESSION_STARTED).length;
    const attendanceCheckedInCount = eventNames.filter((n) => n === SOCKET_EVENTS.ATTENDANCE_CHECKED_IN).length;
    const summaryUpdatedCount = eventNames.filter((n) => n === SOCKET_EVENTS.ATTENDANCE_SUMMARY_UPDATED).length;
    const sessionClosedCount = eventNames.filter((n) => n === SOCKET_EVENTS.SESSION_CLOSED).length;

    expect(sessionCreatedCount).toBe(3); // course-offering, lecturer, faculty
    expect(sessionStartedCount).toBe(3); // session, course-offering, lecturer
    expect(attendanceCheckedInCount).toBe(2); // session, lecturer
    expect(summaryUpdatedCount).toBe(1); // session
    expect(sessionClosedCount).toBe(3); // session, course-offering, lecturer

    // Verify the first emission order is correct
    const firstOfEach = [
      eventNames.findIndex((n) => n === SOCKET_EVENTS.SESSION_CREATED),
      eventNames.findIndex((n) => n === SOCKET_EVENTS.SESSION_STARTED),
      eventNames.findIndex((n) => n === SOCKET_EVENTS.ATTENDANCE_CHECKED_IN),
      eventNames.findIndex((n) => n === SOCKET_EVENTS.ATTENDANCE_SUMMARY_UPDATED),
      eventNames.findIndex((n) => n === SOCKET_EVENTS.SESSION_CLOSED),
    ];
    expect(firstOfEach).toEqual(firstOfEach.slice().sort((a, b) => a - b));
  });

  it("should emit attendance.updated with correct stats after status change", () => {
    const mockIo = makeMockIo();
    registerAttendanceHandlers(mockIo);

    eventBus.emit(BUS_EVENTS.ATTENDANCE_UPDATED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      record: { id: "a1", studentId: "st1", status: "LATE" },
      stats: { total: 30, present: 10, late: 5, absent: 14, excused: 1 },
    });

    const updateEvent = emittedEvents.find(
      (e) => e.event === SOCKET_EVENTS.ATTENDANCE_UPDATED
    );
    expect(updateEvent).toBeDefined();
    expect((updateEvent!.data as Record<string, unknown>).sessionId).toBe("s1");
    expect((updateEvent!.data as Record<string, unknown>).stats).toEqual({
      total: 30,
      present: 10,
      late: 5,
      absent: 14,
      excused: 1,
    });
  });

  it("should handle session.updated event correctly", () => {
    const mockIo = makeMockIo();
    registerSessionHandlers(mockIo);

    eventBus.emit(BUS_EVENTS.SESSION_UPDATED, {
      sessionId: "s1",
      courseOfferingId: "co1",
      session: { id: "s1", topic: "Updated Topic" },
    });

    const updateEvent = emittedEvents.find(
      (e) => e.event === SOCKET_EVENTS.SESSION_UPDATED
    );
    expect(updateEvent).toBeDefined();
    expect((updateEvent!.data as Record<string, unknown>).sessionId).toBe("s1");
    expect(((updateEvent!.data as Record<string, unknown>).session as Record<string, unknown>).topic).toBe("Updated Topic");
  });
});
