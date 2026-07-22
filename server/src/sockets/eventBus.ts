import { EventEmitter } from "events";
import type { AttendanceStatus, SessionStatus } from "@prisma/client";

export const eventBus = new EventEmitter();

eventBus.setMaxListeners(50);

// ─── Domain Event Payloads ───

export interface SessionCreatedEvent {
  sessionId: string;
  courseOfferingId: string;
  lecturerId: string;
  facultyId: string;
  date: string;
  topic: string | null;
}

export interface SessionStartedEvent {
  sessionId: string;
  courseOfferingId: string;
  lecturerId: string;
  facultyId: string;
  session: Record<string, unknown>;
}

export interface SessionUpdatedEvent {
  sessionId: string;
  courseOfferingId: string;
  session: Record<string, unknown>;
}

export interface SessionClosedEvent {
  sessionId: string;
  courseOfferingId: string;
  lecturerId: string;
  facultyId: string;
  session: Record<string, unknown>;
}

export interface AttendanceCheckedInEvent {
  sessionId: string;
  courseOfferingId: string;
  lecturerId: string;
  facultyId: string;
  record: Record<string, unknown>;
  stats: { total: number; present: number; late: number; absent: number; excused: number };
}

export interface AttendanceUpdatedEvent {
  sessionId: string;
  courseOfferingId: string;
  record: Record<string, unknown>;
  stats: { total: number; present: number; late: number; absent: number; excused: number };
}

export interface AttendanceSummaryUpdatedEvent {
  sessionId: string;
  courseOfferingId: string;
  stats: { total: number; present: number; late: number; absent: number; excused: number };
}

// ─── Event Name Constants ───

export const BUS_EVENTS = {
  SESSION_CREATED: "domain:session.created",
  SESSION_STARTED: "domain:session.started",
  SESSION_UPDATED: "domain:session.updated",
  SESSION_CLOSED: "domain:session.closed",
  ATTENDANCE_CHECKED_IN: "domain:attendance.checked_in",
  ATTENDANCE_UPDATED: "domain:attendance.updated",
  ATTENDANCE_SUMMARY_UPDATED: "domain:attendance.summary_updated",
} as const;

// ─── Typed helpers ───

export function emitSessionCreated(data: SessionCreatedEvent): void {
  eventBus.emit(BUS_EVENTS.SESSION_CREATED, data);
}

export function emitSessionStarted(data: SessionStartedEvent): void {
  eventBus.emit(BUS_EVENTS.SESSION_STARTED, data);
}

export function emitSessionUpdated(data: SessionUpdatedEvent): void {
  eventBus.emit(BUS_EVENTS.SESSION_UPDATED, data);
}

export function emitSessionClosed(data: SessionClosedEvent): void {
  eventBus.emit(BUS_EVENTS.SESSION_CLOSED, data);
}

export function emitAttendanceCheckedIn(data: AttendanceCheckedInEvent): void {
  eventBus.emit(BUS_EVENTS.ATTENDANCE_CHECKED_IN, data);
}

export function emitAttendanceUpdated(data: AttendanceUpdatedEvent): void {
  eventBus.emit(BUS_EVENTS.ATTENDANCE_UPDATED, data);
}

export function emitAttendanceSummaryUpdated(data: AttendanceSummaryUpdatedEvent): void {
  eventBus.emit(BUS_EVENTS.ATTENDANCE_SUMMARY_UPDATED, data);
}
