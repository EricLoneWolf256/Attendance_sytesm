import { Server } from "socket.io";
import { eventBus, BUS_EVENTS, SessionCreatedEvent, SessionStartedEvent, SessionUpdatedEvent, SessionClosedEvent } from "../eventBus";
import { SOCKET_EVENTS } from "../events";
import { rooms } from "../rooms";
import { socketLogger } from "../logger";

export function registerSessionHandlers(io: Server): void {
  eventBus.on(BUS_EVENTS.SESSION_CREATED, (data: SessionCreatedEvent) => {
    const { sessionId, courseOfferingId, lecturerId, facultyId, date, topic } = data;

    io.to(rooms.courseOffering(courseOfferingId)).emit(SOCKET_EVENTS.SESSION_CREATED, {
      sessionId,
      courseOfferingId,
      date,
      topic,
    });

    io.to(rooms.lecturer(lecturerId)).emit(SOCKET_EVENTS.SESSION_CREATED, {
      sessionId,
      courseOfferingId,
      date,
      topic,
    });

    io.to(rooms.faculty(facultyId)).emit(SOCKET_EVENTS.SESSION_CREATED, {
      sessionId,
      courseOfferingId,
      date,
      topic,
    });

    socketLogger.info(`session.created → rooms [course-offering=${courseOfferingId}, lecturer=${lecturerId}]`);
  });

  eventBus.on(BUS_EVENTS.SESSION_STARTED, (data: SessionStartedEvent) => {
    const { sessionId, courseOfferingId, lecturerId, session } = data;

    io.to(rooms.session(sessionId)).emit(SOCKET_EVENTS.SESSION_STARTED, {
      sessionId,
      session,
    });

    io.to(rooms.courseOffering(courseOfferingId)).emit(SOCKET_EVENTS.SESSION_STARTED, {
      sessionId,
      session,
    });

    io.to(rooms.lecturer(lecturerId)).emit(SOCKET_EVENTS.SESSION_STARTED, {
      sessionId,
      session,
    });

    socketLogger.info(`session.started → room session:${sessionId}`);
  });

  eventBus.on(BUS_EVENTS.SESSION_UPDATED, (data: SessionUpdatedEvent) => {
    const { sessionId, session } = data;

    io.to(rooms.session(sessionId)).emit(SOCKET_EVENTS.SESSION_UPDATED, {
      sessionId,
      session,
    });

    socketLogger.info(`session.updated → room session:${sessionId}`);
  });

  eventBus.on(BUS_EVENTS.SESSION_CLOSED, (data: SessionClosedEvent) => {
    const { sessionId, courseOfferingId, lecturerId, session } = data;

    io.to(rooms.session(sessionId)).emit(SOCKET_EVENTS.SESSION_CLOSED, {
      sessionId,
      session,
    });

    io.to(rooms.courseOffering(courseOfferingId)).emit(SOCKET_EVENTS.SESSION_CLOSED, {
      sessionId,
      session,
    });

    io.to(rooms.lecturer(lecturerId)).emit(SOCKET_EVENTS.SESSION_CLOSED, {
      sessionId,
      session,
    });

    socketLogger.info(`session.closed → room session:${sessionId}`);
  });
}
