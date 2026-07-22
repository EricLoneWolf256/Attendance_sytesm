import { Server } from "socket.io";
import { eventBus, BUS_EVENTS, AttendanceCheckedInEvent, AttendanceUpdatedEvent, AttendanceSummaryUpdatedEvent } from "../eventBus";
import { SOCKET_EVENTS } from "../events";
import { rooms } from "../rooms";
import { socketLogger } from "../logger";

export function registerAttendanceHandlers(io: Server): void {
  eventBus.on(BUS_EVENTS.ATTENDANCE_CHECKED_IN, (data: AttendanceCheckedInEvent) => {
    const { sessionId, courseOfferingId, lecturerId, record, stats } = data;

    io.to(rooms.session(sessionId)).emit(SOCKET_EVENTS.ATTENDANCE_CHECKED_IN, {
      sessionId,
      record,
      stats,
    });

    io.to(rooms.lecturer(lecturerId)).emit(SOCKET_EVENTS.ATTENDANCE_CHECKED_IN, {
      sessionId,
      record,
      stats,
    });

    socketLogger.info(`attendance.checked_in → session:${sessionId} (student=${(record as Record<string, unknown>).studentId})`);
  });

  eventBus.on(BUS_EVENTS.ATTENDANCE_UPDATED, (data: AttendanceUpdatedEvent) => {
    const { sessionId, record, stats } = data;

    io.to(rooms.session(sessionId)).emit(SOCKET_EVENTS.ATTENDANCE_UPDATED, {
      sessionId,
      record,
      stats,
    });

    socketLogger.info(`attendance.updated → session:${sessionId}`);
  });

  eventBus.on(BUS_EVENTS.ATTENDANCE_SUMMARY_UPDATED, (data: AttendanceSummaryUpdatedEvent) => {
    const { sessionId, stats } = data;

    io.to(rooms.session(sessionId)).emit(SOCKET_EVENTS.ATTENDANCE_SUMMARY_UPDATED, {
      sessionId,
      stats,
    });

    socketLogger.info(`attendance.summary_updated → session:${sessionId} (present=${stats.present}/${stats.total})`);
  });
}
